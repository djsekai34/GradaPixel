import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { categoryColors, type Category } from "@/lib/categories"
import { useArticles, useCategories } from "@/lib/queries"
import type { ArticleSummary } from "@/types/article"
import ArticleCard from "@/components/articles/articleCard"
import PageMessage from "@/components/layout/pageMensaje"

const PAGE_SIZE = 8

function CategoryContent({
  category,
  categories,
  articles,
}: {
  category: Category
  categories: Category[]
  articles: ArticleSummary[]
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  const list = articles.filter((a) => a.category === category.slug)
  const others = categories.filter((c) => c.slug !== category.slug)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <title>{`${category.name} | Grada Pixel`}</title>
      <meta name="description" content={`Últimas noticias de ${category.name} en Grada Pixel.`} />

      <header>
        <h1
          className={`inline-block -skew-x-12 px-6 py-1 font-display text-5xl font-bold uppercase italic leading-tight md:text-7xl ${categoryColors[category.color]}`}
        >
          {category.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {list.length === 1 ? "1 artículo" : `${list.length} artículos`}
        </p>
      </header>

      {list.length === 0 ? (
        <p className="mt-10 font-serif text-lg text-muted-foreground">
          Todavía no hay artículos en esta sección. Vuelve pronto.
        </p>
      ) : (
        <>
          <section aria-label={`Artículos de ${category.name}`} className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {list.slice(0, visible).map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>

          {visible < list.length && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="border border-border px-6 py-2 font-display text-lg font-bold uppercase italic tracking-wide transition-colors hover:border-azul hover:text-azul"
              >
                Cargar más
              </button>
            </div>
          )}
        </>
      )}

      {others.length > 0 && (
        <nav aria-label="Otras secciones" className="mt-16 border-t border-border pt-8">
          <h2 className="font-display text-2xl font-bold italic uppercase">
            Otras <span className="text-azul">secciones</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {others.map((c) => (
              <Link
                key={c.slug}
                to={`/categoria/${c.slug}`}
                className={`inline-block -skew-x-12 px-4 py-1 font-display text-lg font-bold uppercase italic tracking-wide transition-opacity hover:opacity-80 ${categoryColors[c.color]}`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </main>
  )
}

export default function CategoryPage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const categories = useCategories()
  const articles = useArticles()

  if (categories.isPending || articles.isPending) return <PageMessage title="Cargando…" />
  if (categories.isError || articles.isError) {
    return (
      <PageMessage title="Algo ha fallado">
        No hemos podido cargar la sección. Inténtalo de nuevo en unos minutos.
      </PageMessage>
    )
  }

  const category = categories.data.find((c) => c.slug === slug)
  if (!category) {
    return (
      <PageMessage title="Sección no encontrada">
        <title>Sección no encontrada | Grada Pixel</title>
        <p>Esta sección no existe o ha cambiado de dirección.</p>
        <Link to="/" className="mt-6 inline-block font-display text-xl font-bold uppercase italic text-azul">
          Volver a la portada
        </Link>
      </PageMessage>
    )
  }

  // key: al cambiar de sección se reinicia el «Cargar más»
  return (
    <CategoryContent
      key={category.slug}
      category={category}
      categories={categories.data}
      articles={articles.data}
    />
  )
}