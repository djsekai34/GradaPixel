import { useEffect, useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { errorMessage, fetchAdminArticle, saveArticle, type ArticleInput } from "@/lib/api"
import type { Category } from "@/lib/categories"
import type { CreditPlatformChoice } from "@/lib/credit-platforms"
import { fetchNewsletterInfo, sendArticleNewsletter } from "@/lib/newsletter"
import { useCategories } from "@/lib/queries"
import { isValidSlug, slugify } from "@/lib/slug"
import { safeExternalUrl, safeUrl, YOUTUBE_ID } from "@/lib/url"
import type { Article } from "@/types/article"
import PageMessage from "@/components/layout/pageMensaje"
import BlockEditor from "./blockEditor"
import { clean, isEmptyText, newBlock, withIds, type BlockType, type EditorBlock } from "./blocks"
import CoverPicker from "./coverPicker"
import CreditFields from "./creditFields"
import MediaUpload from "./mediaupload"
import NewsletterSend from "./NewsletterSend"
import { savePreview } from "./previewStore"
import { buttonClass, inputClass, primaryButtonClass } from "./ui"

interface FormState {
  title: string
  slug: string
  slugTouched: boolean
  excerpt: string
  category: string
  author: string
  status: "draft" | "published"
  featured: boolean
  image: string
  imageAlt: string
  imageCredit: string
  imageCreditUrl: string
  imageCreditPlatform: CreditPlatformChoice
  imageFocusX: number
  imageFocusY: number
}

const addButtons: { type: BlockType; label: string }[] = [
  { type: "richtext", label: "+ Texto" },
  { type: "heading", label: "+ Subtítulo" },
  { type: "image", label: "+ Imagen" },
  { type: "quote", label: "+ Cita" },
  { type: "video", label: "+ Vídeo YouTube" },
  { type: "upload-video", label: "+ Vídeo propio" },
]

// Mensaje que se pasa de una pantalla a otra cuando se crea un artículo nuevo
function readNotice(state: unknown): string | null {
  if (typeof state === "object" && state !== null && "notice" in state && typeof state.notice === "string") {
    return state.notice
  }
  return null
}

function getProblems(form: FormState, slug: string, blocks: EditorBlock[]): string[] {
  const problems: string[] = []

  if (!form.title.trim()) problems.push("Escribe un título.")
  if (!isValidSlug(slug)) {
    problems.push("La dirección (URL) solo puede tener minúsculas, números y guiones, sin acabar en guion.")
  }
  if (!form.category) problems.push("Elige una sección.")

  if (form.image.trim()) {
    if (!safeUrl(form.image)) problems.push("La imagen de portada no es válida: debe empezar por https://.")
    if (!form.imageAlt.trim()) problems.push("Describe la imagen de portada en su texto alternativo.")
  }
  if (form.imageCreditUrl.trim() && !safeExternalUrl(form.imageCreditUrl)) {
    problems.push("El enlace del crédito de la portada debe empezar por https://.")
  }

  blocks.forEach((b, i) => {
    const n = i + 1
    if (b.type === "image") {
      if (!safeUrl(b.src)) problems.push(`Bloque ${n}: falta la imagen o su dirección no es válida.`)
      else if (!b.alt.trim()) problems.push(`Bloque ${n}: describe la imagen.`)
      if (b.creditUrl?.trim() && !safeExternalUrl(b.creditUrl)) {
        problems.push(`Bloque ${n}: el enlace del crédito debe empezar por https://.`)
      }
    } else if (b.type === "video") {
      if (!YOUTUBE_ID.test(b.youtubeId)) problems.push(`Bloque ${n}: el enlace de YouTube no es válido.`)
    } else if (b.type === "upload-video") {
      if (!safeUrl(b.src)) problems.push(`Bloque ${n}: sube un vídeo.`)
    }
  })

  if (form.status === "published" && blocks.length === 0) {
    problems.push("Un artículo publicado necesita contenido.")
  }

  return problems
}

function EditorForm({ article, categories }: { article: Article | null; categories: Category[] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormState>(() => ({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    slugTouched: article !== null,
    excerpt: article?.excerpt ?? "",
    category: article?.category ?? categories[0]?.slug ?? "",
    author: article?.author ?? "Redacción",
    status: article?.status ?? "draft",
    featured: article?.featured ?? false,
    image: article?.image ?? "",
    imageAlt: article?.imageAlt ?? "",
    imageCredit: article?.imageCredit ?? "",
    imageCreditUrl: article?.imageCreditUrl ?? "",
    imageCreditPlatform: article?.imageCreditPlatform ?? "auto",
    imageFocusX: article?.imageFocusX ?? 50,
    imageFocusY: article?.imageFocusY ?? 50,
  }))
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    article ? withIds(article.content) : [newBlock("richtext")]  )
  const [dirty, setDirty] = useState(false)
  const [problems, setProblems] = useState<string[]>([])
  const [notice, setNotice] = useState<string | null>(() => readNotice(location.state))

  // Aviso por correo: marcado por defecto solo si el artículo todavía no estaba publicado.
  // Un artículo ya publicado antes no avisa a nadie por una simple edición.
  const [notifyOnPublish, setNotifyOnPublish] = useState(article?.status !== "published")

  const newsletterInfo = useQuery({
    queryKey: ["newsletter-info", article?.id],
    queryFn: () => fetchNewsletterInfo(article?.id ?? ""),
    enabled: Boolean(article),
  })
  const alreadySent = Boolean(newsletterInfo.data?.sentAt)

  // La URL de un artículo ya publicado no se puede cambiar (los votos dependen de ella)
  const locked = article?.publishedAt != null
  const finalSlug = locked && article ? article.slug : form.slugTouched ? form.slug : slugify(form.title)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  function updateBlock(index: number, block: EditorBlock) {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)))
    setDirty(true)
  }
  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setDirty(true)
  }
  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }
  function addBlock(type: BlockType) {
    setBlocks((prev) => [...prev, newBlock(type)])
    setDirty(true)
  }

  // Portada: una imagen nueva siempre empieza centrada
  function setCover(url: string, alt?: string) {
    setForm((f) => ({
      ...f,
      image: url,
      imageAlt: f.imageAlt || alt || "",
      imageFocusX: 50,
      imageFocusY: 50,
    }))
    setDirty(true)
  }
  function removeCover() {
    setForm((f) => ({
      ...f,
      image: "",
      imageAlt: "",
      imageCredit: "",
      imageCreditUrl: "",
      imageCreditPlatform: "auto",
      imageFocusX: 50,
      imageFocusY: 50,
    }))
    setDirty(true)
  }

  const save = useMutation({
    mutationFn: async (input: ArticleInput) => {
      const saved = await saveArticle(input, article?.id)

      // Al guardar como publicado por primera vez, se avisa a los suscriptores.
      // El servidor garantiza que cada artículo se avisa una sola vez.
      let result: string | null = null
      if (input.status === "published" && notifyOnPublish && !alreadySent) {
        try {
          const r = await sendArticleNewsletter(saved.id)
          result =
            r.sent === 0
              ? "Guardado. Todavía no hay suscriptores confirmados, así que no se ha enviado ningún aviso."
              : `Guardado y aviso enviado a ${r.sent} ${r.sent === 1 ? "suscriptor" : "suscriptores"}${
                  r.failed > 0 ? ` (no se pudo enviar a ${r.failed})` : ""
                }.`
        } catch (e) {
          const message = e instanceof Error ? e.message : ""
          // Si ya se había avisado, no hay nada que contar
          result = message.includes("ya se avisó")
            ? null
            : `Guardado, pero no se ha podido enviar el aviso: ${message || "error desconocido"} Puedes reintentarlo con el botón del recuadro «Newsletter».`
        }
      }
      return { saved, result }
    },
    onSuccess: ({ saved, result }) => {
      setDirty(false)
      setNotice(result)
      void queryClient.invalidateQueries({ queryKey: ["admin-articles"] })
      void queryClient.invalidateQueries({ queryKey: ["admin-article"] })
      void queryClient.invalidateQueries({ queryKey: ["articles"] })
      void queryClient.invalidateQueries({ queryKey: ["article"] })
      void queryClient.invalidateQueries({ queryKey: ["newsletter-info"] })
      if (!article) navigate(`/admin/articulos/${saved.id}`, { replace: true, state: { notice: result } })
    },
  })

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const content = blocks.filter((b) => !isEmptyText(b))
    const found = getProblems(form, finalSlug, content)
    setProblems(found)
    if (found.length > 0) return

    setNotice(null)
    save.mutate({
      slug: finalSlug,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      category: form.category,
      author: form.author.trim() || "Redacción",
      status: form.status,
      featured: form.featured,
      image: form.image.trim() || null,
      imageAlt: form.imageAlt.trim(),
      imageCredit: form.imageCredit.trim() || null,
      imageCreditUrl: safeExternalUrl(form.imageCreditUrl),
      imageCreditPlatform: form.imageCreditPlatform,
      imageFocusX: form.imageFocusX,
      imageFocusY: form.imageFocusY,
      content: content.map(clean),
    })
  }

  // Abre la web real con lo que estás escribiendo, sin guardar nada en la base de datos
  function openPreview() {
    const ok = savePreview({
      id: article?.id,
      slug: finalSlug || "preview",
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      author: form.author,
      image: form.image,
      imageAlt: form.imageAlt,
      imageCredit: form.imageCredit,
      imageCreditUrl: form.imageCreditUrl,
      imageCreditPlatform: form.imageCreditPlatform,
      focusX: form.imageFocusX,
      focusY: form.imageFocusY,
      blocks,
    })
    if (!ok) {
      setProblems(["No se ha podido preparar la vista previa: el navegador no deja guardar datos."])
      return
    }
    setProblems([])
    window.open("/vista-previa", "gp-preview")?.focus()
  }

  const coverPreview = safeUrl(form.image)

  // Imágenes ya puestas en el artículo, para elegir una como portada
  const imageChoices: { src: string; alt: string }[] = []
  for (const b of blocks) {
    if (b.type === "image" && safeUrl(b.src)) imageChoices.push({ src: b.src, alt: b.alt })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <title>{`${article ? "Editar" : "Nuevo"} artículo | Administración`}</title>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold italic uppercase">
          {article ? "Editar" : "Nuevo"} <span className="text-azul">artículo</span>
        </h1>
        <Link to="/admin" className="text-sm text-muted-foreground underline hover:text-foreground">
          Volver a la lista
        </Link>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-bold">
          Título
        </label>
        <input
          id="title"
          value={form.title}
          maxLength={200}
          onChange={(e) => setField("title", e.target.value)}
          className={`${inputClass} font-display text-2xl font-bold italic uppercase`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-bold">
            Sección
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setField("category", e.target.value)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="author" className="mb-1 block text-sm font-bold">
            Autor
          </label>
          <input
            id="author"
            value={form.author}
            maxLength={80}
            onChange={(e) => setField("author", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1 block text-sm font-bold">
            Dirección (URL)
          </label>
          <input
            id="slug"
            value={finalSlug}
            disabled={locked}
            onChange={(e) => {
              setForm((f) => ({
                ...f,
                slugTouched: true,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
              }))
              setDirty(true)
            }}
            onBlur={() => {
              if (!locked) setForm((f) => ({ ...f, slugTouched: true, slug: slugify(finalSlug) }))
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {locked
              ? "Este artículo ya se publicó: su dirección no se puede cambiar."
              : `Será /articulo/${finalSlug || "…"}. Después de publicar no se podrá cambiar.`}
          </p>
        </div>

        <div className="flex items-end">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setField("featured", e.target.checked)}
              className="mt-1 size-4 accent-azul"
            />
            <span>
              <span className="block font-bold">Destacado</span>
              <span className="text-muted-foreground">
                Sale en grande en la portada. Solo uno a la vez.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm font-bold">
          Resumen
        </label>
        <textarea
          id="excerpt"
          rows={3}
          maxLength={500}
          value={form.excerpt}
          onChange={(e) => setField("excerpt", e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {form.excerpt.length}/500. Sale bajo el titular, al compartir en redes y en el correo de aviso.
        </p>
      </div>

      <fieldset className="space-y-4 border border-border p-4">
        <legend className="px-2 font-display text-xl font-bold italic uppercase">
          Imagen de portada
        </legend>
        <p className="text-sm text-muted-foreground">
          Todas las portadas se muestran con la misma altura. Si tu imagen es vertical o más alta,
          se recorta, y tú eliges qué parte se ve.
        </p>

        {imageChoices.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-bold">Elegir entre las imágenes de este artículo</p>
            <ul className="flex flex-wrap gap-2">
              {imageChoices.map((c, i) => (
                <li key={`${i}-${c.src}`}>
                  <button
                    type="button"
                    onClick={() => setCover(c.src, c.alt)}
                    aria-label="Usar esta imagen como portada"
                    aria-pressed={form.image === c.src}
                    className={`block border-2 ${
                      form.image === c.src ? "border-azul" : "border-border hover:border-foreground"
                    }`}
                  >
                    <img src={c.src} alt="" className="h-20 w-auto" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <MediaUpload kind="image" onUploaded={(url) => setCover(url)} />

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-bold">
            O pega la dirección de una imagen (https://…)
          </label>
          <input
            id="image"
            value={form.image}
            onChange={(e) => setField("image", e.target.value)}
            className={inputClass}
          />
        </div>

        {coverPreview && (
          <CoverPicker
            src={form.image}
            focusX={form.imageFocusX}
            focusY={form.imageFocusY}
            onChange={(x, y) => {
              setForm((f) => ({ ...f, imageFocusX: x, imageFocusY: y }))
              setDirty(true)
            }}
          />
        )}

        <div>
          <label htmlFor="imageAlt" className="mb-1 block text-sm font-bold">
            Descripción de la imagen (obligatoria si hay portada)
          </label>
          <input
            id="imageAlt"
            value={form.imageAlt}
            maxLength={200}
            onChange={(e) => setField("imageAlt", e.target.value)}
            className={inputClass}
          />
        </div>

        <CreditFields
          textLabel="Crédito de la foto: nombre o usuario (opcional)"
          value={{
            text: form.imageCredit,
            url: form.imageCreditUrl,
            platform: form.imageCreditPlatform,
          }}
          onChange={(v) => {
            setForm((f) => ({
              ...f,
              imageCredit: v.text,
              imageCreditUrl: v.url,
              imageCreditPlatform: v.platform,
            }))
            setDirty(true)
          }}
        />

        {form.image && (
          <button type="button" onClick={removeCover} className={buttonClass}>
            Quitar portada
          </button>
        )}
      </fieldset>

      <section aria-label="Contenido">
        <h2 className="font-display text-2xl font-bold italic uppercase">Contenido</h2>

        {blocks.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Todavía no hay bloques. Añade el primero con los botones de abajo.
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {blocks.map((b, i) => (
            <BlockEditor
              key={b._id}
              block={b}
              index={i}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              onChange={(nb) => updateBlock(i, nb)}
              onMove={(d) => moveBlock(i, d)}
              onRemove={() => removeBlock(i)}
            />
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {addButtons.map((a) => (
            <button key={a.type} type="button" onClick={() => addBlock(a.type)} className={buttonClass}>
              {a.label}
            </button>
          ))}
        </div>
      </section>

      {article && (
        <NewsletterSend
          articleId={article.id}
          published={article.status === "published"}
          dirty={dirty}
        />
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 py-3">
        {problems.length > 0 && (
          <ul role="alert" className="mb-3 list-disc space-y-1 pl-5 text-sm text-destructive">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
        {save.isError && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {errorMessage(save.error)}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-3 text-sm">
            {notice}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="status" className="text-sm font-bold">
            Estado
          </label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setField("status", e.target.value === "published" ? "published" : "draft")}
            className={`${inputClass} w-auto`}
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>

          {form.status === "published" && !alreadySent && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyOnPublish}
                onChange={(e) => setNotifyOnPublish(e.target.checked)}
                className="size-4 accent-azul"
              />
              Avisar a los suscriptores por correo al guardar
            </label>
          )}

          <button type="submit" disabled={save.isPending} className={primaryButtonClass}>
            {save.isPending ? "Guardando…" : "Guardar"}
          </button>

          <button type="button" onClick={openPreview} className={buttonClass}>
            Vista previa
          </button>

          {article && (
            <Link
              to={`/articulo/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              Ver
            </Link>
          )}

          <span className="text-sm text-muted-foreground" role="status">
            {save.isSuccess && !dirty ? "Guardado ✓" : dirty ? "Cambios sin guardar" : ""}
          </span>
        </div>
      </div>
    </form>
  )
}

export default function ArticleEditorPage() {
  const { id } = useParams<{ id: string }>()
  const categories = useCategories()
  const articleQuery = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => fetchAdminArticle(id ?? ""),
    enabled: Boolean(id),
  })

  if (categories.isPending || (id && articleQuery.isPending)) {
    return <p className="text-muted-foreground">Cargando…</p>
  }
  if (categories.isError || articleQuery.isError) {
    return (
      <PageMessage title="Algo ha fallado">
        No se ha podido cargar el editor. Vuelve a intentarlo.
      </PageMessage>
    )
  }
  if (id && !articleQuery.data) {
    return (
      <PageMessage title="No encontrado">
        <Link to="/admin" className="underline">
          Volver a la lista
        </Link>
      </PageMessage>
    )
  }
  if (categories.data.length === 0) {
    return (
      <PageMessage title="Primero crea una sección">
        <Link to="/admin/secciones" className="underline">
          Ir a Secciones
        </Link>
      </PageMessage>
    )
  }

  return (
    <EditorForm
      key={id ?? "new"}
      article={id ? (articleQuery.data ?? null) : null}
      categories={categories.data}
    />
  )
}
