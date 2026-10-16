import { createClient } from "jsr:@supabase/supabase-js@2"
import { env } from "../_shared/config.ts"
import { notifyArticle } from "../_shared/notify.ts"

const admin = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false },
})

const CRON_SECRET = (Deno.env.get("CRON_SECRET") ?? "").trim()
const MAX_PER_RUN = 2 // artículos por ejecución, para no pasarse del tiempo de la función

function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a)
  const y = new TextEncoder().encode(b)
  if (x.length !== y.length) return false
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

// Lo llama la base de datos cada 5 minutos. Avisa de los artículos ya publicados
// que se programaron con la casilla «Avisar a los suscriptores».
Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 })

  const received = (req.headers.get("x-cron-secret") ?? "").trim()
  if (!CRON_SECRET || !safeEqual(received, CRON_SECRET)) {
    return new Response("No autorizado", { status: 401 })
  }

  try {
    const { data, error } = await admin
      .from("articles")
      .select("id,slug")
      .eq("status", "published")
      .eq("newsletter_auto", true)
      .is("newsletter_sent_at", null)
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: true })
      .limit(MAX_PER_RUN)
    if (error) throw error

    const processed: Record<string, unknown>[] = []
    for (const article of data ?? []) {
      const result = await notifyArticle(admin, article.id)

      // Pase lo que pase, se deja de intentar solo. Si falló, se reintenta a mano desde el editor.
      await admin.from("articles").update({ newsletter_auto: false }).eq("id", article.id)

      if (result.ok) {
        processed.push({ slug: article.slug, sent: result.sent, failed: result.failed })
      } else {
        console.error(`Aviso automático fallido (${article.slug}): ${result.error}`)
        processed.push({ slug: article.slug, error: result.error })
      }
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error(e)
    return new Response("Error", { status: 500 })
  }
})