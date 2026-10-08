import { createClient } from "jsr:@supabase/supabase-js@2"
import { env } from "../_shared/config.ts"
import { sendBatch, sleep, type OutgoingEmail } from "../_shared/email.ts"
import { corsFor, json, UUID } from "../_shared/http.ts"
import { articleEmail } from "../_shared/templates.ts"

const admin = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false },
})

interface Recipient {
  email: string
  unsub_token: string
}

async function activeSubscribers(): Promise<Recipient[]> {
  const out: Recipient[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .select("email,unsub_token")
      .eq("status", "active")
      .order("id")
      .range(from, from + 999)
    if (error) throw error
    out.push(...((data ?? []) as Recipient[]))
    if (!data || data.length < 1000) break
  }
  return out
}

async function releaseClaim(id: string) {
  await admin.from("articles").update({ newsletter_sent_at: null }).eq("id", id)
}

Deno.serve(async (req) => {
  const cors = corsFor(req)
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, cors)

  try {
    // Solo un administrador con sesión iniciada puede enviar
    const userClient = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      auth: { persistSession: false },
    })
    const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin")
    if (adminError || isAdmin !== true) return json({ error: "No autorizado." }, 403, cors)

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return json({ error: "Petición no válida." }, 400, cors)
    }
    const articleId =
      typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).articleId : null
    if (typeof articleId !== "string" || !UUID.test(articleId)) {
      return json({ error: "Artículo no válido." }, 400, cors)
    }

    // Se «reserva» el envío: si ya se envió, o no está publicado, no devuelve nada
    const claimedAt = new Date().toISOString()
    const { data: article, error: claimError } = await admin
      .from("articles")
      .update({ newsletter_sent_at: claimedAt })
      .eq("id", articleId)
      .eq("status", "published")
      .is("newsletter_sent_at", null)
      .select("id,slug,title,excerpt,image_url,category_slug")
      .maybeSingle()
    if (claimError) throw claimError
    if (!article) {
      return json({ error: "Este artículo ya se avisó o todavía no está publicado." }, 409, cors)
    }

    const subscribers = await activeSubscribers()
    if (subscribers.length === 0) {
      await releaseClaim(article.id)
      return json({ ok: true, sent: 0, failed: 0 }, 200, cors)
    }

    const { data: categoryRow } = await admin
      .from("categories")
      .select("name,color")
      .eq("slug", article.category_slug)
      .maybeSingle()
    const category =
      categoryRow && typeof categoryRow.name === "string" && typeof categoryRow.color === "string"
        ? { name: categoryRow.name, color: categoryRow.color }
        : null

    const articleUrl = `${env.siteUrl}/articulo/${article.slug}`
    const imageUrl =
      typeof article.image_url === "string" && article.image_url.startsWith("https://")
        ? article.image_url
        : null

    const messages: OutgoingEmail[] = subscribers.map((s) => {
      const unsubUrl = `${env.siteUrl}/newsletter/baja?token=${s.unsub_token}`
      const oneClick = `${env.supabaseUrl}/functions/v1/newsletter?action=one-click&token=${s.unsub_token}`
      return {
        to: s.email,
        ...articleEmail({
          title: article.title,
          excerpt: article.excerpt ?? "",
          imageUrl,
          articleUrl,
          unsubUrl,
          category,
        }),
        headers: {
          "List-Unsubscribe": `<${oneClick}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }
    })

    // La clave incluye el momento de la reserva: un reintento posterior no choca con uno anterior
    const keyBase = `article-${article.id}-${claimedAt}`

    let sent = 0
    let failed = 0
    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100)
      try {
        await sendBatch(chunk, `${keyBase}-chunk-${i / 100}`)
        sent += chunk.length
      } catch (e) {
        console.error("Lote fallido", e)
        failed += chunk.length
      }
      if (i + 100 < messages.length) await sleep(700)
    }

    // Si no salió nada, se libera para poder reintentarlo
    if (sent === 0) {
      await releaseClaim(article.id)
      return json({ error: "No se ha podido enviar ningún correo. Revisa la configuración de envío." }, 502, cors)
    }

    return json({ ok: true, sent, failed }, 200, cors)
  } catch (e) {
    console.error(e)
    return json({ error: "Ha ocurrido un error. Inténtalo de nuevo." }, 500, cors)
  }
})
