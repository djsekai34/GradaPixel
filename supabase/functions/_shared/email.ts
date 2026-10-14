import { env } from "./config.ts"

export interface OutgoingEmail {
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Envía un correo a través del intermediario de la web (que lo manda con Gmail)
async function relay(m: OutgoingEmail): Promise<void> {
  if (!env.relaySecret || !env.siteUrl) {
    throw new Error("Falta RELAY_SECRET o SITE_URL en los secretos de Supabase")
  }

  const res = await fetch(env.relayUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-relay-secret": env.relaySecret },
    body: JSON.stringify({
      to: m.to,
      subject: m.subject,
      html: m.html,
      text: m.text,
      headers: m.headers,
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Envío ${res.status}: ${detail.slice(0, 300)}`)
  }
}

export async function sendEmail(m: OutgoingEmail): Promise<void> {
  await relay(m)
}

// Envía varios correos a la vez (de pocos en pocos) y cuenta cuántos salieron
export async function sendMany(
  list: OutgoingEmail[],
  concurrency = 6
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  let next = 0

  async function worker() {
    while (true) {
      const i = next++
      if (i >= list.length) return
      try {
        await relay(list[i])
        sent++
      } catch (e) {
        failed++
        console.error("Envío fallido", e)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, worker))
  return { sent, failed }
}