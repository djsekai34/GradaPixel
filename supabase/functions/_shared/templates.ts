import { env } from "./config.ts"
import { escapeHtml } from "./email.ts"

// Mismos colores que las etiquetas de sección de la web
const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  rojo: { bg: "#dc1c24", fg: "#ffffff" },
  verde: { bg: "#0a9e1f", fg: "#ffffff" },
  naranja: { bg: "#ff7a00", fg: "#ffffff" },
  amarillo: { bg: "#f5d90a", fg: "#000000" },
  morado: { bg: "#5b21e6", fg: "#ffffff" },
  azul: { bg: "#0a84ff", fg: "#ffffff" },
  marino: { bg: "#08245b", fg: "#ffffff" },
}

const HEADLINE_FONT = "'Arial Narrow',Arial,Helvetica,sans-serif"

function button(url: string, label: string): string {
  return `<a href="${escapeHtml(url)}" style="display:inline-block;background:#08245b;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:bold;font-size:16px;">${escapeHtml(label)}</a>`
}

// Cabecera: una sola imagen con el fondo negro y la franja azul DENTRO de la imagen.
// Así el modo oscuro de Gmail no puede invertir el negro (las imágenes no se invierten).
// Si no hay imagen configurada, se usa una cabecera de texto.
function header(): string {
  const name = escapeHtml(env.senderName)

  if (env.logoUrl.startsWith("https://")) {
    return `<tr><td bgcolor="#000000" style="padding:0;font-size:0;line-height:0;background:#000000;"><img src="${escapeHtml(env.logoUrl)}" alt="${name}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>`
  }

  return `<tr><td align="center" bgcolor="#000000" style="background:#000000;padding:16px 24px;color:#ffffff;font-size:24px;font-weight:bold;font-style:italic;text-transform:uppercase;letter-spacing:1px;">${name}</td></tr>
<tr><td height="4" bgcolor="#08245b" style="background:#08245b;font-size:0;line-height:0;">&nbsp;</td></tr>`
}

function shell(inner: string, note: string, preheader = ""): string {
  const sender = escapeHtml(env.senderName)
  const address = env.senderAddress ? ` · ${escapeHtml(env.senderAddress)}` : ""
  const hidden = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>`
    : ""

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111111;">
${hidden}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">
${header()}
<tr><td style="padding:24px;font-size:16px;line-height:1.6;">${inner}</td></tr>
<tr><td style="padding:16px 24px;background:#fafafa;font-size:12px;line-height:1.5;color:#666666;">${note}<br>${sender}${address}</td></tr>
</table></td></tr></table></body></html>`
}

// ---------- Piezas comunes: todos los correos comparten este estilo ----------

// Titular grande en cursiva y mayúsculas, con la palabra clave en azul y una raya debajo
function pageHeading(plain: string, accent: string): string {
  return `<h2 style="margin:0;font-family:${HEADLINE_FONT};font-size:32px;line-height:1.1;font-weight:bold;font-style:italic;text-transform:uppercase;color:#08245b;">${escapeHtml(plain)} <span style="color:#0a84ff;">${escapeHtml(accent)}</span></h2>
<div style="width:56px;height:3px;background:#0a84ff;margin:10px 0 20px;font-size:0;line-height:0;">&nbsp;</div>`
}

// Etiqueta de color (como las de sección de la web)
function chip(label: string, bg: string, fg: string): string {
  return `<p style="margin:0 0 12px;"><span style="display:inline-block;background:${bg};color:${fg};padding:3px 12px;font-size:12px;font-weight:bold;font-style:italic;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(label)}</span></p>`
}

// Tarjeta con borde: imagen opcional, etiqueta opcional, título y contenido
function card(opts: {
  imageRow?: string
  chipHtml?: string
  title: string
  titleUrl?: string
  body: string
}): string {
  const title = opts.titleUrl
    ? `<a href="${escapeHtml(opts.titleUrl)}" style="color:#111111;text-decoration:none;">${escapeHtml(opts.title)}</a>`
    : escapeHtml(opts.title)

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;">
${opts.imageRow ?? ""}
<tr><td style="padding:20px;">
${opts.chipHtml ?? ""}<h1 style="margin:0 0 12px;font-family:${HEADLINE_FONT};font-size:28px;line-height:1.15;font-weight:bold;font-style:italic;text-transform:uppercase;color:#111111;">${title}</h1>
${opts.body}
</td></tr>
</table>`
}

const paragraph = (text: string) =>
  `<p style="margin:0 0 20px;color:#444444;">${escapeHtml(text)}</p>`

const buttonRow = (url: string, label: string) => `<p style="margin:0;">${button(url, label)}</p>`

const smallNote = (text: string) =>
  `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#666666;">${escapeHtml(text)}</p>`

// Aviso destacado (recuadro azul claro con raya a la izquierda). Solo recibe texto fijo nuestro.
const noticeBox = (html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;"><tr><td bgcolor="#eef6ff" style="background:#eef6ff;border-left:4px solid #0a84ff;padding:12px 16px;font-size:14px;line-height:1.5;color:#111111;">${html}</td></tr></table>`

// ---------- Correos ----------

export function confirmEmail(confirmUrl: string) {
  const name = env.senderName
  const inner =
    pageHeading("Confirma tu", "suscripción") +
    card({
      chipHtml: chip("Newsletter", "#08245b", "#ffffff"),
      title: "Un último paso",
      body:
        paragraph(
          `Has pedido recibir por correo los avisos de nuevos artículos de ${name}. Confirma que este es tu correo para empezar a recibirlos.`
        ) +
        noticeBox(
          "<strong>Importante:</strong> al pulsar el botón se abrirá nuestra web. Allí tendrás que pulsar <strong>«Confirmar mi suscripción»</strong> una vez más para terminar."
        ) +
        buttonRow(confirmUrl, "Confirmar suscripción") +
        smallNote("Si no has sido tú, ignora este mensaje: no recibirás nada. El enlace caduca en 7 días."),
    })

  return {
    subject: `Confirma tu suscripción a ${name}`,
    html: shell(
      inner,
      "Has recibido este correo porque alguien ha solicitado la suscripción con esta dirección.",
      "Un último paso: abre la web y pulsa «Confirmar mi suscripción»."
    ),
    text: `CONFIRMA TU SUSCRIPCIÓN\n\nHas pedido recibir por correo los avisos de nuevos artículos de ${name}.\n\nIMPORTANTE: al abrir este enlace se abrirá nuestra web. Allí tendrás que pulsar «Confirmar mi suscripción» una vez más para terminar:\n${confirmUrl}\n\nSi no has sido tú, ignora este mensaje: no recibirás nada. El enlace caduca en 7 días.`,
  }
}

export function unsubscribeLinkEmail(unsubUrl: string) {
  const name = env.senderName
  const inner =
    pageHeading("Darte de", "baja") +
    card({
      chipHtml: chip("Newsletter", "#08245b", "#ffffff"),
      title: "Sentimos que te vayas",
      body:
        paragraph(`Has pedido dejar de recibir los avisos de ${name}.`) +
        noticeBox(
          "<strong>Importante:</strong> al pulsar el botón se abrirá nuestra web. Allí tendrás que pulsar <strong>«Darme de baja»</strong> una vez más para terminar."
        ) +
        buttonRow(unsubUrl, "Darme de baja") +
        smallNote("Si no has sido tú, ignora este mensaje y seguirás suscrito."),
    })

  return {
    subject: `Darte de baja de la newsletter de ${name}`,
    html: shell(
      inner,
      "Has recibido este correo porque alguien ha solicitado la baja con esta dirección.",
      "Abre la web y pulsa «Darme de baja» para terminar."
    ),
    text: `DARTE DE BAJA\n\nHas pedido dejar de recibir los avisos de ${name}.\n\nIMPORTANTE: al abrir este enlace se abrirá nuestra web. Allí tendrás que pulsar «Darme de baja» una vez más para terminar:\n${unsubUrl}\n\nSi no has sido tú, ignora este mensaje y seguirás suscrito.`,
  }
}

export function articleEmail(a: {
  title: string
  excerpt: string
  imageUrl: string | null
  articleUrl: string
  unsubUrl: string
  category: { name: string; color: string } | null
}) {
  const name = env.senderName

  const imageRow = a.imageUrl
    ? `<tr><td style="padding:0;"><a href="${escapeHtml(a.articleUrl)}"><img src="${escapeHtml(a.imageUrl)}" alt="" width="550" style="display:block;width:100%;height:auto;border:0;"></a></td></tr>`
    : ""

  const colors = a.category ? (CATEGORY_COLORS[a.category.color] ?? CATEGORY_COLORS.azul) : null
  const chipHtml = a.category && colors ? chip(a.category.name, colors.bg, colors.fg) : ""

  const inner =
    pageHeading("Nuevo", "artículo") +
    card({
      imageRow,
      chipHtml,
      title: a.title,
      titleUrl: a.articleUrl,
      body: (a.excerpt ? paragraph(a.excerpt) : "") + buttonRow(a.articleUrl, "Leer el artículo"),
    })

  return {
    subject: `Nuevo artículo en ${name}: ${a.title}`.slice(0, 150),
    html: shell(
      inner,
      `Recibes este correo porque te suscribiste a los avisos de ${escapeHtml(name)}. <a href="${escapeHtml(a.unsubUrl)}" style="color:#666666;">Darme de baja</a>`,
      a.excerpt || a.title
    ),
    text: `NUEVO ARTÍCULO${a.category ? ` · ${a.category.name}` : ""}\n\n${a.title}\n\n${a.excerpt ? a.excerpt + "\n\n" : ""}Léelo aquí: ${a.articleUrl}\n\n---\nRecibes este correo porque te suscribiste a los avisos de ${name}.\nDarte de baja: ${a.unsubUrl}`,
  }
}
