import type { SupabaseClient } from "jsr:@supabase/supabase-js@2"
import { env } from "./config.ts"
import { sendMany, type OutgoingEmail } from "./email.ts"
import { articleEmail } from "./templates.ts"

// Con Gmail y el límite de tiempo de la función, más de esto no cabe en un solo envío
export const MAX_RECIPIENTS = 250

export type NotifyResult =
  | { ok: true; sent: number; failed: number }
  | { ok: false; status: number; error: string }

interface Recipient {
  email: string
  unsub_token: string
}

async function activeSubscribers(admin: SupabaseClient): Promise<Recipient[]> {
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

async function releaseClaim(admin: SupabaseClient, id: string) {
  await admin.from("articles").update({ newsletter_sent_at: null }).eq("id", id)
}

export async function notifyArticle(admin: SupabaseClient, articleId: string): Promise<NotifyResult> {
  // Se «reserva» el envío: si ya se envió, o no está publicado, no devuelve nada
  const claimedAt = new Date().toISOString()
  const { data: article, error: claimError } = await admin
    .from("articles")
    .update({ newsletter_sent_at: claimedAt })
    .eq("id", articleId)
    .eq("status", "published")
    .lte("published_at", claimedAt)
    .is("newsletter_sent_at", null)
    .select("id,slug,title,excerpt,image_url,category_slug")
    .maybeSingle()
  if (claimError) throw claimError
  if (!article) {
    return { ok: false, status: 409, error: "Este artículo ya se avisó o todavía no está publicado." }
  }

  const subscribers = await activeSubscribers(admin)
  if (subscribers.length === 0) {
    await releaseClaim(admin, article.id)
    return { ok: true, sent: 0, failed: 0 }
  }
  if (subscribers.length > MAX_RECIPIENTS) {
    await releaseClaim(admin, article.id)
    return {
      ok: false,
      status: 413,
      error: `Hay ${subscribers.length} suscriptores y con el envío por Gmail el máximo es ${MAX_RECIPIENTS} de una vez. Hace falta un dominio propio para seguir creciendo.`,
    }
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

  const { sent, failed } = await sendMany(messages)

  // Si no salió nada, se libera para poder reintentarlo
  if (sent === 0) {
    await releaseClaim(admin, article.id)
    return {
      ok: false,
      status: 502,
      error: "No se ha podido enviar ningún correo. Revisa la configuración de envío.",
    }
  }

  return { ok: true, sent, failed }
}