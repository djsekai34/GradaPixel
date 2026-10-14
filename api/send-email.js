// Intermediario de envío: recibe un correo ya preparado y lo envía con la cuenta de Gmail.
// Solo acepta peticiones que lleven la clave secreta compartida con las funciones de Supabase.

import nodemailer from "nodemailer"
import { timingSafeEqual } from "node:crypto"

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const ALLOWED_HEADERS = new Set(["List-Unsubscribe", "List-Unsubscribe-Post"])

function safeEqual(a, b) {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

// Texto de una sola línea (sin saltos: evita colar cabeceras falsas)
function oneLine(value, max) {
  return typeof value === "string" && value.length > 0 && value.length <= max && !/[\r\n]/.test(value)
}

let transporter
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
  }
  return transporter
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" })
    return
  }

  const secret = process.env.RELAY_SECRET
  const received = req.headers["x-relay-secret"]
  if (!secret || typeof received !== "string" || !safeEqual(received, secret)) {
    res.status(401).json({ error: "No autorizado" })
    return
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("Faltan GMAIL_USER o GMAIL_APP_PASSWORD")
    res.status(500).json({ error: "Envío no configurado" })
    return
  }

  const b = req.body && typeof req.body === "object" ? req.body : {}

  if (!oneLine(b.to, 254) || !EMAIL.test(b.to)) {
    res.status(400).json({ error: "Destinatario no válido" })
    return
  }
  if (!oneLine(b.subject, 200)) {
    res.status(400).json({ error: "Asunto no válido" })
    return
  }
  if (typeof b.html !== "string" || b.html.length === 0 || b.html.length > 200_000) {
    res.status(400).json({ error: "Contenido no válido" })
    return
  }
  if (typeof b.text !== "string" || b.text.length > 100_000) {
    res.status(400).json({ error: "Texto no válido" })
    return
  }

  // Solo se admiten las cabeceras de baja
  const headers = {}
  if (b.headers && typeof b.headers === "object") {
    for (const [key, value] of Object.entries(b.headers)) {
      if (ALLOWED_HEADERS.has(key) && oneLine(value, 600)) headers[key] = value
    }
  }

  try {
    await getTransporter().sendMail({
      from: { name: process.env.SENDER_NAME || "Grada Pixel", address: process.env.GMAIL_USER },
      to: b.to,
      subject: b.subject,
      html: b.html,
      text: b.text,
      ...(process.env.NEWSLETTER_REPLY_TO ? { replyTo: process.env.NEWSLETTER_REPLY_TO } : {}),
      headers,
    })
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error("No se pudo enviar el correo", e)
    res.status(502).json({ error: "No se pudo enviar el correo" })
  }
}