import { supabase } from "@/lib/supabase"
import { isCategoryColor, type Category, type CategoryColor } from "@/lib/categories"
import { isPlatformChoice, type CreditPlatformChoice } from "@/lib/credit-platforms"
import { sanitizeRich } from "@/lib/richtext"
import { safeExternalUrl, safeUrl, YOUTUBE_ID } from "@/lib/url"
import type { Article, ArticleSummary, ContentBlock } from "@/types/article"

function db() {
  if (!supabase) throw new Error("Supabase no está configurado (revisa .env.local)")
  return supabase
}

function rows<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : []
}

export function errorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const err = e as { code?: string; message?: string }
    if (err.code === "23503") return "No se puede borrar: todavía hay artículos en esta sección."
    if (err.code === "23505") return "Ya existe uno con esa URL."
    if (err.message) return err.message
  }
  return "Ha ocurrido un error. Inténtalo de nuevo."
}

// ---------- Secciones ----------

interface CategoryRow {
  slug: string
  name: string
  color: string
  sort_order: number
}

function toCategory(r: CategoryRow): Category {
  return {
    slug: r.slug,
    name: r.name,
    color: isCategoryColor(r.color) ? r.color : "azul",
    sortOrder: r.sort_order,
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await db()
    .from("categories")
    .select("slug,name,color,sort_order")
    .order("sort_order")
    .order("name")
  if (error) throw error
  return rows<CategoryRow>(data).map(toCategory)
}

export async function createCategory(input: {
  slug: string
  name: string
  color: CategoryColor
  sortOrder: number
}): Promise<void> {
  const { error } = await db().from("categories").insert({
    slug: input.slug,
    name: input.name,
    color: input.color,
    sort_order: input.sortOrder,
  })
  if (error) throw error
}

export async function updateCategory(
  slug: string,
  input: { name: string; color: CategoryColor; sortOrder: number }
): Promise<void> {
  const { error } = await db()
    .from("categories")
    .update({ name: input.name, color: input.color, sort_order: input.sortOrder })
    .eq("slug", slug)
  if (error) throw error
}

export async function deleteCategory(slug: string): Promise<void> {
  const { error } = await db().from("categories").delete().eq("slug", slug)
  if (error) throw error
}

// ---------- Artículos ----------

const SUMMARY_COLUMNS =
  "id,slug,title,excerpt,category_slug,author,status,featured,published_at,image_url,image_alt,image_credit,image_credit_url,image_credit_platform,image_focus_x,image_focus_y,created_at"

interface SummaryRow {
  id: string
  slug: string
  title: string
  excerpt: string
  category_slug: string
  author: string
  status: string
  featured: boolean
  published_at: string | null
  image_url: string | null
  image_alt: string
  image_credit: string | null
  image_credit_url: string | null
  image_credit_platform: string
  image_focus_x: number
  image_focus_y: number
  created_at: string
}

interface ArticleRow extends SummaryRow {
  content: unknown
}

function optionalString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined
}

// El contenido viene de la base de datos: se revisa bloque a bloque y se descarta lo que no sea válido
function parseBlock(raw: unknown): ContentBlock | null {
  if (typeof raw !== "object" || raw === null) return null
  const b = raw as Record<string, unknown>

  switch (b.type) {
    case "paragraph":
      return typeof b.text === "string" ? { type: "paragraph", text: b.text } : null
    case "richtext":
      return typeof b.html === "string" ? { type: "richtext", html: sanitizeRich(b.html) } : null
    case "heading":
      return typeof b.text === "string" ? { type: "heading", text: b.text } : null
    case "quote":
      return typeof b.text === "string"
        ? { type: "quote", text: b.text, author: optionalString(b.author) }
        : null
    case "image": {
      const src = safeUrl(b.src)
      if (!src || typeof b.alt !== "string") return null
      const creditUrl = safeExternalUrl(b.creditUrl)
      const creditPlatform: CreditPlatformChoice = isPlatformChoice(b.creditPlatform)
        ? b.creditPlatform
        : "auto"
      return {
        type: "image",
        src,
        alt: b.alt,
        caption: optionalString(b.caption),
        credit: optionalString(b.credit),
        ...(creditUrl ? { creditUrl } : {}),
        creditPlatform,
      }
    }
    case "video": {
      if (typeof b.youtubeId !== "string" || !YOUTUBE_ID.test(b.youtubeId)) return null
      return {
        type: "video",
        youtubeId: b.youtubeId,
        title: optionalString(b.title) ?? "Vídeo",
        caption: optionalString(b.caption),
      }
    }
    case "upload-video": {
      const src = safeUrl(b.src)
      if (!src) return null
      return {
        type: "upload-video",
        src,
        title: optionalString(b.title) ?? "Vídeo",
        caption: optionalString(b.caption),
      }
    }
    default:
      return null
  }
}

export function parseContent(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => parseBlock(item)).filter((b): b is ContentBlock => b !== null)
}

// El punto de enfoque de la portada siempre queda entre 0 y 100
function clampPercent(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 50
}

function toSummary(r: SummaryRow): ArticleSummary {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    category: r.category_slug,
    author: r.author,
    status: r.status === "published" ? "published" : "draft",
    featured: r.featured,
    publishedAt: r.published_at,
    createdAt: r.created_at,
    image: safeUrl(r.image_url),
    imageAlt: r.image_alt,
    imageCredit: r.image_credit,
    imageCreditUrl: safeExternalUrl(r.image_credit_url),
    imageCreditPlatform: isPlatformChoice(r.image_credit_platform) ? r.image_credit_platform : "auto",
    imageFocusX: clampPercent(r.image_focus_x),
    imageFocusY: clampPercent(r.image_focus_y),
  }
}

function toArticle(r: ArticleRow): Article {
  return { ...toSummary(r), content: parseContent(r.content) }
}

// Web pública: solo artículos publicados
export async function fetchPublishedArticles(): Promise<ArticleSummary[]> {
  const { data, error } = await db()
    .from("articles")
    .select(SUMMARY_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
  if (error) throw error
  return rows<SummaryRow>(data).map(toSummary)
}

// Un artículo por URL. Los borradores solo los devuelve la base de datos si eres admin
export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await db().from("articles").select("*").eq("slug", slug).maybeSingle()
  if (error) throw error
  return data ? toArticle(data as unknown as ArticleRow) : null
}

// ---------- Panel de administración ----------

export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await db().rpc("is_admin")
  if (error) throw error
  return data === true
}

export async function fetchAdminArticles(): Promise<ArticleSummary[]> {
  const { data, error } = await db()
    .from("articles")
    .select(SUMMARY_COLUMNS)
    .order("created_at", { ascending: false })
  if (error) throw error
  return rows<SummaryRow>(data).map(toSummary)
}

export async function setArticleStatus(id: string, status: "draft" | "published"): Promise<void> {
  const { error } = await db().from("articles").update({ status }).eq("id", id)
  if (error) throw error
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await db().from("articles").delete().eq("id", id)
  if (error) throw error
}

// ---------- Editor de artículos ----------

export interface ArticleInput {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  status: "draft" | "published"
  featured: boolean
  image: string | null
  imageAlt: string
  imageCredit: string | null
  imageCreditUrl: string | null
  imageCreditPlatform: CreditPlatformChoice
  imageFocusX: number
  imageFocusY: number
  content: ContentBlock[]
}

export async function fetchAdminArticle(id: string): Promise<Article | null> {
  const { data, error } = await db().from("articles").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return data ? toArticle(data as unknown as ArticleRow) : null
}

export async function saveArticle(
  input: ArticleInput,
  id?: string
): Promise<{ id: string; slug: string }> {
  const payload = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    category_slug: input.category,
    author: input.author,
    status: input.status,
    featured: input.featured,
    image_url: input.image,
    image_alt: input.imageAlt,
    image_credit: input.imageCredit,
    image_credit_url: safeExternalUrl(input.imageCreditUrl),
    image_credit_platform: input.imageCreditPlatform,
    image_focus_x: clampPercent(input.imageFocusX),
    image_focus_y: clampPercent(input.imageFocusY),
    content: input.content,
  }

  let saved: { id: string; slug: string }

  if (id) {
    const { data, error } = await db()
      .from("articles")
      .update(payload)
      .eq("id", id)
      .select("id,slug")
      .single()
    if (error) throw error
    saved = data as { id: string; slug: string }
  } else {
    const { data, error } = await db().from("articles").insert(payload).select("id,slug").single()
    if (error) throw error
    saved = data as { id: string; slug: string }
  }

  // Solo puede haber un artículo destacado
  if (input.featured) {
    const { error } = await db()
      .from("articles")
      .update({ featured: false })
      .eq("featured", true)
      .neq("id", saved.id)
    if (error) throw error
  }

  return saved
}

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
}
const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 50

export async function uploadMedia(file: File, kind: "image" | "video"): Promise<string> {
  const ext = MIME_EXT[file.type]
  if (!ext || !file.type.startsWith(`${kind}/`)) {
    throw new Error(
      kind === "image"
        ? "Formato no permitido. Usa JPG, PNG o WebP."
        : "Formato no permitido. Usa MP4 o WebM."
    )
  }

  const maxMb = kind === "image" ? MAX_IMAGE_MB : MAX_VIDEO_MB
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`El archivo pesa demasiado. El máximo es ${maxMb} MB.`)
  }

  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const path = `${kind}s/${now.getFullYear()}/${month}/${crypto.randomUUID()}.${ext}`

  const client = db()
  const { error } = await client.storage.from("media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  })
  if (error) throw error

  return client.storage.from("media").getPublicUrl(path).data.publicUrl
}
