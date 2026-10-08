export const YOUTUBE_ID = /^[\w-]{11}$/

// Solo se aceptan enlaces https o rutas propias de la web
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  if (v.startsWith("/") && !v.startsWith("//")) return v
  try {
    return new URL(v).protocol === "https:" ? v : null
  } catch {
    return null
  }
}

// Enlaces externos (créditos): solo https, nunca rutas propias
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const v = value.trim()
  if (v.length === 0 || v.length > 500) return null
  try {
    return new URL(v).protocol === "https:" ? v : null
  } catch {
    return null
  }
}

// Acepta el identificador suelto o un enlace de YouTube (watch, youtu.be, embed, shorts, live)
export function parseYoutubeId(input: string): string | null {
  const v = input.trim()
  if (YOUTUBE_ID.test(v)) return v
  try {
    const u = new URL(v)
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "")
    let id: string | null = null

    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0] ?? null
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v")
      } else {
        const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)
        id = m ? m[1] : null
      }
    }
    return id && YOUTUBE_ID.test(id) ? id : null
  } catch {
    return null
  }
}