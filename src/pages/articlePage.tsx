import { Link, useParams } from "react-router-dom"
import { useArticle, useArticles } from "@/lib/queries"
import ArticleView from "@/components/articles/articleView"
import PageMessage from "@/components/layout/pageMensaje"

export default function ArticlePage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const articleQuery = useArticle(slug)
  const allQuery = useArticles()

  if (articleQuery.isPending) return <PageMessage title="Cargando…" />
  if (articleQuery.isError) {
    return (
      <PageMessage title="Algo ha fallado">
        No hemos podido cargar el artículo. Inténtalo de nuevo en unos minutos.
      </PageMessage>
    )
  }

  const article = articleQuery.data
  if (!article) {
    return (
      <PageMessage title="No encontrado">
        <title>Artículo no encontrado | Grada Pixel</title>
        <p>Este artículo no existe o ha cambiado de dirección.</p>
        <Link to="/" className="mt-6 inline-block font-display text-xl font-bold uppercase italic text-azul">
          Volver a la portada
        </Link>
      </PageMessage>
    )
  }

  return <ArticleView article={article} all={allQuery.data ?? []} />
}