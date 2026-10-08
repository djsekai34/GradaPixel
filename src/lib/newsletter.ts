import { FunctionsHttpError } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

async function readError(e: unknown): Promise<string> {
  if (e instanceof FunctionsHttpError) {
    try {
      const body: unknown = await e.context.json()
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        return body.error
      }
    } catch {
      // Sin detalle del servidor
    }
  }
  return "No hemos podido completar la acción. Inténtalo de nuevo."
}

async function call(fn: "newsletter" | "newsletter-notify", body: Record<string, unknown>): Promise<unknown> {
  if (!supabase) throw new Error("La newsletter no está disponible ahora mismo.")
  const { data, error } = await supabase.functions.invoke(fn, { body })
  if (error) throw new Error(await readError(error))
  return data
}

export async function subscribe(email: string, consent: boolean, website: string): Promise<void> {
  await call("newsletter", { action: "subscribe", email, consent, website })
}

export async function confirmSubscription(token: string): Promise<void> {
  await call("newsletter", { action: "confirm", token })
}

export async function unsubscribe(token: string): Promise<void> {
  await call("newsletter", { action: "unsubscribe", token })
}

export async function requestUnsubscribeLink(email: string): Promise<void> {
  await call("newsletter", { action: "request-unsubscribe", email })
}

// ---------- Panel de administración ----------

export interface NewsletterInfo {
  sentAt: string | null
  active: number
  pending: number
}

export async function fetchNewsletterInfo(articleId: string): Promise<NewsletterInfo> {
  if (!supabase) throw new Error("Supabase no está configurado")

  const [article, stats] = await Promise.all([
    supabase.from("articles").select("newsletter_sent_at").eq("id", articleId).maybeSingle(),
    supabase.rpc("newsletter_stats"),
  ])
  if (article.error) throw article.error
  if (stats.error) throw stats.error

  const row: unknown = Array.isArray(stats.data) ? stats.data[0] : null
  const r = (row ?? {}) as { active_count?: unknown; pending_count?: unknown }
  const sentAt: unknown = (article.data as { newsletter_sent_at?: unknown } | null)?.newsletter_sent_at

  return {
    sentAt: typeof sentAt === "string" ? sentAt : null,
    active: Number(r.active_count ?? 0),
    pending: Number(r.pending_count ?? 0),
  }
}

export async function sendArticleNewsletter(articleId: string): Promise<{ sent: number; failed: number }> {
  const data = await call("newsletter-notify", { articleId })
  const d = (typeof data === "object" && data !== null ? data : {}) as { sent?: unknown; failed?: unknown }
  return { sent: Number(d.sent ?? 0), failed: Number(d.failed ?? 0) }
}
