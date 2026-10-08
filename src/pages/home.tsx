import { Link } from "react-router-dom"
import { useArticles } from "@/lib/queries"
import ArticleCard from "@/components/articles/articleCard"
import CategoryTag from "@/components/articles/categoryTag"
import PageMessage from "@/components/layout/pageMensaje"

export default function Home() {
  const { data, isPending, isError } = useArticles()

  if (isPending) return <PageMessage title="Cargando…" />
  if (isError) {
    return (
      <PageMessage title="Algo ha fallado">
        No hemos podido cargar las noticias. Inténtalo de nuevo en unos minutos.
      </PageMessage>
    )
  }
  if (data.length === 0) {
    return <PageMessage title="Muy pronto">Todavía no hay artículos publicados.</PageMessage>
  }

  const featured = data.find((a) => a.featured) ?? data[0]
  const rest = data.filter((a) => a.slug !== featured.slug).slice(0, 12)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="bg-brand p-8 text-white">
        <CategoryTag slug={featured.category} />
        <h1 className="mt-4 font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
          <Link to={`/articulo/${featured.slug}`}>{featured.title}</Link>
        </h1>
        {featured.excerpt && (
          <p className="mt-4 max-w-2xl font-serif text-white/80">{featured.excerpt}</p>
        )}
      </section>

      {rest.length > 0 && (
        <section aria-label="Últimas noticias" className="mt-10">
          <h2 className="font-display text-3xl font-bold italic uppercase">
            Últimas <span className="text-azul">noticias</span>
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {rest.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}