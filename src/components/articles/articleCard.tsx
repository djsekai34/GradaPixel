import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { ArticleSummary } from "@/types/article"
import CategoryTag from "./categoryTag"
import Cover from "./cover"

export default function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="border border-border bg-card p-5 transition-colors hover:border-azul">
      {article.image && (
        <Link to={`/articulo/${article.slug}`} tabIndex={-1} aria-hidden="true" className="mb-4 block">
          <Cover
            src={article.image}
            alt=""
            focusX={article.imageFocusX}
            focusY={article.imageFocusY}
            variant="card"
          />
        </Link>
      )}
      <CategoryTag slug={article.category} />
      <h3 className="mt-3 font-display text-2xl font-bold italic uppercase leading-tight">
        <Link to={`/articulo/${article.slug}`}>{article.title}</Link>
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