import { parseContent } from "@/lib/api"
import { isPlatformChoice, type CreditPlatformChoice } from "@/lib/credit-platforms"
import { safeExternalUrl, safeUrl } from "@/lib/url"
import type { Article } from "@/types/article"
import { clean, isEmptyText, type EditorBlock } from "./blocks"

export const PREVIEW_KEY = "gp-article-preview"

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface PreviewInput {
  id?: string // identificador del artículo, si ya está guardado
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  image: string
  imageAlt: string
  imageCredit: string
  imageCreditUrl: string
  imageCreditPlatform: CreditPlatformChoice
  focusX: number
  focusY: number
  blocks: EditorBlock[]
}

// Guarda en este navegador lo que estás escribiendo, para enseñarlo en la pestaña de la vista previa
export function savePreview(input: PreviewInput): boolean {
  const data = {
    id: input.id ?? "",
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category: input.category,
    author: input.author,
    image: input.image,
    imageAlt: input.imageAlt,
    imageCredit: input.imageCredit,
    imageCreditUrl: input.imageCreditUrl,
    imageCreditPlatform: input.imageCreditPlatform,
    focusX: input.focusX,
    focusY: input.focusY,
    content: input.blocks.filter((b) => !isEmptyText(b)).map(clean),
    savedAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function text(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function percent(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50
}

// Se revisa todo al leerlo, igual que con los datos de la base de datos
export function readPreview(): Article | null {
  try {
    const raw = localStorage.getItem(PREVIEW_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return null
    const o = parsed as Record<string, unknown>

    const time = Date.parse(text(o.savedAt))
    const createdAt = new Date(Number.isNaN(time) ? Date.now() : time).toISOString()
    const slug = SLUG.test(text(o.slug)) ? text(o.slug) : "preview"
    const id = UUID.test(text(o.id)) ? text(o.id) : "preview"

    return {
      id,
      slug,
      title: text(o.title).trim() || "Sin título",
      excerpt: text(o.excerpt),
      category: text(o.category),
      author: text(o.author).trim() || "Redacción",
      status: "published",
      featured: false,
      publishedAt: createdAt,
      createdAt,
      image: safeUrl(o.image),
      imageAlt: text(o.imageAlt),
      imageCredit: text(o.imageCredit) || null,
      imageCreditUrl: safeExternalUrl(o.imageCreditUrl),
      imageCreditPlatform: isPlatformChoice(o.imageCreditPlatform) ? o.imageCreditPlatform : "auto",
      imageFocusX: percent(o.focusX),
      imageFocusY: percent(o.focusY),
      content: parseContent(o.content),
    }
  } catch {
    return null
  }
}