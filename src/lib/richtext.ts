import DOMPurify from "dompurify"

export const RICH_MAX_LENGTH = 20_000

// Solo se permiten estas etiquetas y atributos: el resto se elimina
const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li"]
const ALLOWED_ATTR = ["href", "target", "rel"]

let ready = false
function setup() {
  if (ready) return
  ready = true
  // Los enlaces solo pueden ser https o mailto, y siempre se abren en pestaña nueva
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node instanceof Element && node.tagName === "A") {
      const href = node.getAttribute("href") ?? ""
      if (/^(?:https:\/\/|mailto:)/i.test(href)) {
        node.setAttribute("target", "_blank")
        node.setAttribute("rel", "noopener noreferrer")
      } else {
        node.removeAttribute("href")
        node.removeAttribute("target")
        node.removeAttribute("rel")
      }
    }
  })
}

// Limpia el HTML del texto enriquecido. Se usa al guardar, al leer de la base de datos y al mostrarlo.
export function sanitizeRich(html: string): string {
  setup()
  const input = html.length > RICH_MAX_LENGTH ? html.slice(0, RICH_MAX_LENGTH) : html
  return String(
    DOMPurify.sanitize(input, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP: /^(?:https:|mailto:)/i,
    })
  ).trim()
}

export function isHtmlEmpty(html: string): boolean {
  return (
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim() === ""
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// Convierte un párrafo antiguo (texto plano) en HTML para el editor
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("")
}

// Mismo aspecto en el editor y en la web pública
export const richTextClass =
  "font-serif text-lg leading-8 [&_p]:mb-4 [&>p:last-child]:mb-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_a]:text-azul [&_a]:underline [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_li_p]:mb-0 [&>ul:last-child]:mb-0 [&>ol:last-child]:mb-0"
