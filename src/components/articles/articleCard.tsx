import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { ArticleSummary } from "@/types/article"
import CategoryTag from "./categoryTag"
import Cover from "./cover"

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative border border-border bg-card p-5 transition-colors hover:border-azul has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-azul">
      {article.image && (
        <div className="mb-4">
          <Cover
            src={article.image}
            alt=""
            focusX={article.imageFocusX}
            focusY={article.imageFocusY}
            variant="card"
          />
        </div>
      )}

      {/* La etiqueta queda por encima del enlace de la tarjeta para seguir llevando a su sección */}
      <div className="relative z-10 inline-block">
        <CategoryTag slug={article.category} />
      </div>

      <h3 className="mt-3 font-display text-2xl font-bold italic uppercase leading-tight">
        {/* Este enlace se estira por toda la tarjeta (el ::after cubre el cuadrado entero) */}
        <Link
          to={`/articulo/${article.slug}`}
          className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-azul focus-visible:outline-none"
        >
          {article.title}
        </Link>
      </h3>

      {article.excerpt && (
        <p className="mt-2 font-serif text-sm text-muted-foreground">{article.excerpt}</p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {article.author} ·{" "}
        {formatDistanceToNow(new Date(article.publishedAt ?? article.createdAt), {
          addSuffix: true,
          locale: es,
        })}
      </p>
    </article>
  )
}