import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Article, ArticleSummary } from "@/types/article"
import ArticleBody from "./articleBody"
import ArticleCard from "./articleCard"
import ArticleVoting from "./articlesvoting"
import ArticleVotingPreview from "./articleVotingPreview"
import CategoryTag from "./categoryTag"
import Cover from "./cover"
import Credit from "./Credit"
import ShareButtons from "./shareButtons"

interface Props {
  article: Article
  all: ArticleSummary[] // artículos publicados, para las noticias relacionadas
  preview?: boolean
}

export default function ArticleView({ article, all, preview = false }: Props) {
  // Nunca se sugiere el propio artículo: se compara por identificador y por dirección
  const candidates = all.filter((a) => a.id !== article.id && a.slug !== article.slug)
  const sameCategory = candidates.filter((a) => a.category === article.category)
  const others = candidates.filter((a) => a.category !== article.category)
  const related = [...sameCategory, ...others].slice(0, 3)
  const shownDate = article.publishedAt ?? article.createdAt
  const hasCoverCredit = Boolean(article.imageCredit?.trim() || article.imageCreditUrl)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {preview ? (
        <>
          <title>{`${article.title} | Grada Pixel`}</title>
          <meta name="robots" content="noindex, nofollow" />
        </>
      ) : (
        <>
          <title>{`${article.title} | Grada Pixel`}</title>
          <meta name="description" content={article.excerpt} />
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.excerpt} />
          {article.image && <meta property="og:image" content={article.image} />}
          <meta property="og:type" content="article" />
        </>
      )}

      {/* Etiqueta flotante: no mueve el diseño del artículo */}
      {(preview || article.status === "draft") && (
        <p
          role="status"
          className="fixed bottom-4 left-4 z-40 max-w-xs border border-azul bg-background px-3 py-2 text-xs shadow-lg"
        >
          {preview
            ? "Vista previa: sin guardar ni publicar. Los vídeos de YouTube piden permiso antes de cargarse. Cierra esta pestaña para volver al editor."
            : "Borrador: solo lo ves tú, porque has iniciado sesión como administrador."}
        </p>
      )}

      <article>
        <header className="mx-auto max-w-3xl">
          {article.category && <CategoryTag slug={article.category} />}
          <h1 className="mt-4 font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
            {article.title}
          </h1>
          {article.excerpt && (
            <p className="mt-4 font-serif text-xl text-muted-foreground">{article.excerpt}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Por <span className="font-bold text-foreground">{article.author}</span> ·{" "}
            <time dateTime={shownDate}>
              {format(new Date(shownDate), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
            </time>
          </p>
        </header>

        {article.image && (
          <figure className="my-8">
            <Cover
              src={article.image}
              alt={article.imageAlt}
              focusX={article.imageFocusX}
              focusY={article.imageFocusY}
              variant="hero"
            />
            {hasCoverCredit && (
              <figcaption className="mt-2 text-sm text-muted-foreground">
                <Credit
                  text={article.imageCredit}
                  url={article.imageCreditUrl}
                  platform={article.imageCreditPlatform}
                />
              </figcaption>
            )}
          </figure>
        )}

        <div className="mx-auto max-w-3xl">
          <ArticleBody blocks={article.content} />

          {preview ? (
            <ArticleVotingPreview />
          ) : (
            article.status === "published" && <ArticleVoting key={article.slug} slug={article.slug} />
          )}

          <div className="mt-6 border-t border-border pt-6">
            <ShareButtons
              title={article.title}
              url={preview ? `${window.location.origin}/articulo/${article.slug}` : undefined}
            />
          </div>
        </div>
      </article>

      <section aria-label="Noticias relacionadas" className="mt-16">
        <h2 className="font-display text-3xl font-bold italic uppercase">
          Sigue <span className="text-azul">leyendo</span>
        </h2>
        {related.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        ) : (
          <p className="mt-4 font-serif text-muted-foreground">
            Todavía no hay más artículos publicados. Vuelve pronto.
          </p>
        )}
      </section>
    </main>
  )
}