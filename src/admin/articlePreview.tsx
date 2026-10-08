import type { ContentBlock } from "@/types/article"
import ArticleBody from "@/components/articles/articleBody"
import CategoryTag from "@/components/articles/categoryTag"
import Cover from "@/components/articles/cover"
import { safeUrl, YOUTUBE_ID } from "@/lib/url"
import { clean, isEmptyText, type EditorBlock } from "./blocks"

interface PreviewData {
  title: string
  excerpt: string
  category: string
  author: string
  image: string
  imageAlt: string
  imageCredit: string
  focusX: number
  focusY: number
}

// Se enseña solo lo que ya es válido, como hará la web pública
function toPreviewBlocks(blocks: EditorBlock[]): ContentBlock[] {
  return blocks
    .filter((b) => !isEmptyText(b))
    .map(clean)
    .filter((b) => {
      if (b.type === "image" || b.type === "upload-video") return safeUrl(b.src) !== null
      if (b.type === "video") return YOUTUBE_ID.test(b.youtubeId)
      return true
    })
}

export default function ArticlePreview({ data, blocks }: { data: PreviewData; blocks: EditorBlock[] }) {
  const cover = safeUrl(data.image)

  return (
    <section aria-label="Vista previa" className="border border-azul p-4 md:p-8">
      <p role="note" className="mb-6 border border-azul bg-azul/10 px-4 py-2 text-sm">
        Vista previa de lo que estás escribiendo, aunque todavía no lo hayas guardado. Los vídeos de
        YouTube piden permiso al lector antes de cargarse: pulsa «Cargar este vídeo» para verlos.
      </p>

      <article>
        <header className="mx-auto max-w-3xl">
          {data.category && <CategoryTag slug={data.category} />}
          <h1 className="mt-4 font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
            {data.title.trim() || "Sin título"}
          </h1>
          {data.excerpt.trim() && (
            <p className="mt-4 font-serif text-xl text-muted-foreground">{data.excerpt}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Por <span className="font-bold text-foreground">{data.author.trim() || "Redacción"}</span>
          </p>
        </header>

        {cover && (
          <figure className="my-8">
            <Cover
              src={cover}
              alt={data.imageAlt}
              focusX={data.focusX}
              focusY={data.focusY}
              variant="hero"
            />
            {data.imageCredit.trim() && (
              <figcaption className="mt-2 text-sm text-muted-foreground">{data.imageCredit}</figcaption>
            )}
          </figure>
        )}

        <div className="mx-auto max-w-3xl">
          <ArticleBody blocks={toPreviewBlocks(blocks)} />
        </div>
      </article>
    </section>
  )
}