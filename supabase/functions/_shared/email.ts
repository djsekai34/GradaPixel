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

async function resend(
  path: string,
  payload: unknown,
  idempotencyKey?: string,
  attempt = 0
): Promise<void> {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  })

  // Demasiadas peticiones seguidas: esperamos y reintentamos
  if (res.status === 429 && attempt < 2) {
    await sleep(1500 * (attempt + 1))
    return resend(path, payload, idempotencyKey, attempt + 1)
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`)
  }
}

function toPayload(m: OutgoingEmail) {
  return {
    from: env.from,
    to: [m.to],
    subject: m.subject,
    html: m.html,
    text: m.text,
    ...(env.replyTo ? { reply_to: env.replyTo } : {}),
    ...(m.headers ? { headers: m.headers } : {}),
  }
}

export async function sendEmail(m: OutgoingEmail): Promise<void> {
  await resend("/emails", toPayload(m))
}

// Hasta 100 correos por petición
export async function sendBatch(list: OutgoingEmail[], idempotencyKey: string): Promise<void> {
  await resend("/emails/batch", list.map(toPayload), idempotencyKey)
}
