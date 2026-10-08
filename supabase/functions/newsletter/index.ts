import { createClient } from "jsr:@supabase/supabase-js@2"
import { env } from "../_shared/config.ts"
import { sendEmail } from "../_shared/email.ts"
import { corsFor, json, UUID } from "../_shared/http.ts"
import { confirmEmail, unsubscribeLinkEmail } from "../_shared/templates.ts"

const CONSENT_VERSION = "2026-10"
const COOLDOWN_MS = 5 * 60_000 // no reenviamos antes de 5 minutos
const EXPIRE_MS = 7 * 24 * 3600_000 // la confirmación caduca a los 7 días
const HOURLY_CAP = 100 // tope de correos de confirmación por hora (contra abusos)
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

const admin = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false },
})

const COLUMNS = "id,email,status,confirm_token,unsub_token,last_email_at"

interface Subscriber {
  id: string
  email: string
  status: string
  confirm_token: string
  unsub_token: string
  last_email_at: string | null
}

function normalizeEmail(v: unknown): string | null {
  if (typeof v !== "string") return null
  const e = v.trim().toLowerCase()
  return e.length <= 254 && EMAIL.test(e) ? e : null
}

async function findByEmail(email: string): Promise<Subscriber | null> {
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select(COLUMNS)
    .eq("email", email)
    .maybeSingle()
  if (error) throw error
  return data as Subscriber | null
}

function recentlyEmailed(s: Subscriber): boolean {
  return s.last_email_at !== null && Date.now() - Date.parse(s.last_email_at) < COOLDOWN_MS
}

async function overHourlyCap(): Promise<boolean> {
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count, error } = await admin
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .gt("last_email_at", since)
  if (error) throw error
  return (count ?? 0) >= HOURLY_CAP
}

async function unsubscribeByToken(token: string): Promise<boolean> {
  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id,status")
    .eq("unsub_token", token)
    .maybeSingle()
  if (error) throw error
  if (!data) return false
  if (data.status !== "unsubscribed") {
    const { error: e2 } = await admin
      .from("newsletter_subscribers")
  .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        last_email_at: null,
      })      .eq("id", data.id)
    if (e2) throw e2
  }
  return true
}

type Cors = Record<string, string>

async function subscribe(body: Record<string, unknown>, cors: Cors): Promise<Response> {
  // Campo trampa: los robots lo rellenan, las personas no lo ven
  if (typeof body.website === "string" && body.website !== "") return json({ ok: true }, 200, cors)

  if (body.consent !== true) return json({ error: "Debes aceptar para suscribirte." }, 400, cors)
  const email = normalizeEmail(body.email)
  if (!email) return json({ error: "Escribe un correo válido." }, 400, cors)

  let sub = await findByEmail(email)
  // Respuesta idéntica si ya existe: no se revela quién está suscrito
  if (sub?.status === "active") return json({ ok: true }, 200, cors)
  if (sub && recentlyEmailed(sub)) return json({ ok: true }, 200, cors)

  if (await overHourlyCap()) {
    return json({ error: "Hay demasiadas solicitudes ahora mismo. Inténtalo más tarde." }, 429, cors)
  }

  const now = new Date().toISOString()
  if (!sub) {
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .insert({ email, consent_version: CONSENT_VERSION, last_email_at: now })
      .select(COLUMNS)
      .single()
    if (error) {
      if (error.code === "23505") return json({ ok: true }, 200, cors)
      throw error
    }
    sub = data as Subscriber
  } else {
    const patch =
      sub.status === "unsubscribed"
        ? {
            status: "pending",
            confirm_token: crypto.randomUUID(),
            consent_version: CONSENT_VERSION,
            last_email_at: now,
          }
        : { consent_version: CONSENT_VERSION, last_email_at: now }
    const { data, error } = await admin
      .from("newsletter_subscribers")
      .update(patch)
      .eq("id", sub.id)
      .select(COLUMNS)
      .single()
    if (error) throw error
    sub = data as Subscriber
  }

  try {
    await sendEmail({
      to: email,
      ...confirmEmail(`${env.siteUrl}/newsletter/confirmar?token=${sub.confirm_token}`),
    })
  } catch (e) {
    console.error("No se pudo enviar la confirmación", e)
    await admin.from("newsletter_subscribers").update({ last_email_at: null }).eq("id", sub.id)
    return json({ error: "No hemos podido enviar el correo. Inténtalo de nuevo." }, 502, cors)
  }

  return json({ ok: true }, 200, cors)
}

async function confirm(body: Record<string, unknown>, cors: Cors): Promise<Response> {
  const token = body.token
  if (typeof token !== "string" || !UUID.test(token)) {
    return json({ error: "Enlace no válido." }, 400, cors)
  }

  const { data, error } = await admin
    .from("newsletter_subscribers")
    .select("id,status,last_email_at")
    .eq("confirm_token", token)
    .maybeSingle()
  if (error) throw error

  if (!data || data.status === "unsubscribed") {
    return json({ error: "Enlace no válido o ya utilizado." }, 404, cors)
  }
  if (data.status === "active") return json({ ok: true }, 200, cors)

  const sentAt = data.last_email_at ? Date.parse(data.last_email_at) : 0
  if (Date.now() - sentAt > EXPIRE_MS) {
    return json({ error: "El enlace ha caducado. Suscríbete de nuevo para recibir otro." }, 410, cors)
  }

  const { error: e2 } = await admin
    .from("newsletter_subscribers")
    .update({
      status: "active",
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
      last_email_at: null,
    })    .eq("id", data.id)
  if (e2) throw e2
  return json({ ok: true }, 200, cors)
}

async function unsubscribe(body: Record<string, unknown>, cors: Cors): Promise<Response> {
  const token = body.token
  if (typeof token !== "string" || !UUID.test(token)) {
    return json({ error: "Enlace no válido." }, 400, cors)
  }
  // Si la fila ya se archivó, la persona ya está dada de baja: se responde igual
  await unsubscribeByToken(token)
  return json({ ok: true }, 200, cors)
}

// Quien no tiene a mano un correo anterior pide aquí un enlace de baja
async function requestUnsubscribe(body: Record<string, unknown>, cors: Cors): Promise<Response> {
  const email = normalizeEmail(body.email)
  if (!email) return json({ error: "Escribe un correo válido." }, 400, cors)

  const sub = await findByEmail(email)
  if (sub?.status !== "active" || recentlyEmailed(sub)) return json({ ok: true }, 200, cors)
  if (await overHourlyCap()) {
    return json({ error: "Hay demasiadas solicitudes ahora mismo. Inténtalo más tarde." }, 429, cors)
  }

  await admin
    .from("newsletter_subscribers")
    .update({ last_email_at: new Date().toISOString() })
    .eq("id", sub.id)

  try {
    await sendEmail({
      to: email,
      ...unsubscribeLinkEmail(`${env.siteUrl}/newsletter/baja?token=${sub.unsub_token}`),
    })
  } catch (e) {
    console.error("No se pudo enviar el enlace de baja", e)
    await admin.from("newsletter_subscribers").update({ last_email_at: null }).eq("id", sub.id)
    return json({ error: "No hemos podido enviar el correo. Inténtalo de nuevo." }, 502, cors)
  }
  return json({ ok: true }, 200, cors)
}

Deno.serve(async (req) => {
  const cors = corsFor(req)
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const url = new URL(req.url)

    // Baja con un clic desde el propio cliente de correo (cabecera List-Unsubscribe)
    if (url.searchParams.get("action") === "one-click") {
      if (req.method !== "POST") return new Response("Método no permitido", { status: 405 })
      const token = url.searchParams.get("token") ?? ""
      if (UUID.test(token)) await unsubscribeByToken(token)
      return new Response("ok", { status: 200 })
    }

    if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, cors)

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return json({ error: "Petición no válida." }, 400, cors)
    }
    if (typeof raw !== "object" || raw === null) return json({ error: "Petición no válida." }, 400, cors)
    const body = raw as Record<string, unknown>

    switch (body.action) {
      case "subscribe":
        return await subscribe(body, cors)
      case "confirm":
        return await confirm(body, cors)
      case "unsubscribe":
        return await unsubscribe(body, cors)
      case "request-unsubscribe":
        return await requestUnsubscribe(body, cors)
      default:
        return json({ error: "Acción no válida." }, 400, cors)
    }
  } catch (e) {
    console.error(e)
    return json({ error: "Ha ocurrido un error. Inténtalo de nuevo." }, 500, cors)
  }
})
