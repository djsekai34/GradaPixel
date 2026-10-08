import { isHtmlEmpty, sanitizeRich, textToHtml } from "@/lib/richtext"
import { safeExternalUrl } from "@/lib/url"
import type { ContentBlock } from "@/types/article"

// En el editor cada bloque lleva un identificador interno, para poder reordenarlos
export type EditorBlock = ContentBlock & { _id: string }
export type BlockType = ContentBlock["type"]

export function newBlock(type: BlockType): EditorBlock {
  const _id = crypto.randomUUID()
  switch (type) {
    case "paragraph":
      return { _id, type, text: "" }
    case "richtext":
      return { _id, type, html: "" }
    case "heading":
      return { _id, type, text: "" }
    case "quote":
      return { _id, type, text: "", author: "" }
    case "image":
      return { _id, type, src: "", alt: "", caption: "", credit: "", creditUrl: "", creditPlatform: "auto" }
    case "video":
      return { _id, type, youtubeId: "", title: "", caption: "" }
    case "upload-video":
      return { _id, type, src: "", title: "", caption: "" }
  }
}

// Al abrir un artículo, los párrafos antiguos (texto plano) pasan a texto con formato
export function withIds(content: ContentBlock[]): EditorBlock[] {
  return content.map((b): EditorBlock => {
    if (b.type === "paragraph") {
      return { _id: crypto.randomUUID(), type: "richtext", html: textToHtml(b.text) }
    }
    return { ...b, _id: crypto.randomUUID() }
  })
}

export function isEmptyText(b: EditorBlock): boolean {
  if (b.type === "richtext") return isHtmlEmpty(b.html)
  return (
    (b.type === "paragraph" || b.type === "heading" || b.type === "quote") && b.text.trim() === ""
  )
}

// Lo que se guarda en la base de datos: sin el identificador interno y sin campos vacíos
export function clean(b: EditorBlock): ContentBlock {
  switch (b.type) {
    case "paragraph":
      return { type: "paragraph", text: b.text.trim() }
    case "richtext":
      return { type: "richtext", html: sanitizeRich(b.html) }
    case "heading":
      return { type: "heading", text: b.text.trim() }
    case "quote":
      return {
        type: "quote",
        text: b.text.trim(),
        ...(b.author?.trim() ? { author: b.author.trim() } : {}),
      }
    case "image": {
      const creditUrl = safeExternalUrl(b.creditUrl)
      return {
        type: "image",
        src: b.src.trim(),
        alt: b.alt.trim(),
        ...(b.caption?.trim() ? { caption: b.caption.trim() } : {}),
        ...(b.credit?.trim() ? { credit: b.credit.trim() } : {}),
        ...(creditUrl ? { creditUrl } : {}),
        ...(b.creditPlatform && b.creditPlatform !== "auto"
          ? { creditPlatform: b.creditPlatform }
          : {}),
      }
    }
    case "video":
      return {
        type: "video",
        youtubeId: b.youtubeId.trim(),
        title: b.title.trim() || "Vídeo",
        ...(b.caption?.trim() ? { caption: b.caption.trim() } : {}),
      }
    case "upload-video":
      return {
        type: "upload-video",
        src: b.src.trim(),
        title: b.title.trim() || "Vídeo",
        ...(b.caption?.trim() ? { caption: b.caption.trim() } : {}),
      }
  }
}
