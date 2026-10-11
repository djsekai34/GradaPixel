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

  // El destacado tiene su propia foto y su propio encuadre. Si no los ha tocado, usa los de la portada.
  const heroImage = featured.featureImage ?? featured.image
  const heroX = featured.featureFocusX ?? featured.imageFocusX
  const heroY = featured.featureFocusY ?? featured.imageFocusY

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section
        className={`group relative isolate flex flex-col justify-end overflow-hidden bg-brand p-5 text-white md:p-8 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white ${
          heroImage ? "min-h-56 md:min-h-72" : "transition hover:brightness-110"
        }`}
      >
        {heroImage && (
          <>
            {/* La foto es decorativa: el título ya describe el artículo */}
            <img
              src={heroImage}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              style={{ objectPosition: `${heroX}% ${heroY}%` }}
            />
            {/* Degradado en el azul de la marca: asegura que el texto se lea sobre cualquier foto */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-t from-brand via-brand/70 to-transparent"
            />
          </>
        )}

        {/* La etiqueta queda por encima del enlace del bloque para seguir llevando a su sección */}
        <div className="relative z-10 w-fit">
          <CategoryTag slug={featured.category} />
        </div>

        <h1 className="mt-3 font-display text-4xl font-bold italic uppercase leading-none [text-shadow:0_2px_12px_rgb(0_0_0/0.6)] md:text-6xl">
          {/* Este enlace se estira por todo el bloque */}
          <Link
            to={`/articulo/${featured.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {featured.title}
          </Link>
        </h1>
        {featured.excerpt && (
          <p className="mt-3 max-w-2xl font-serif text-white/90 [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]">
            {featured.excerpt}
          </p>
        )}
      </section>

      {rest.length > 0 && (
        <section aria-label="Últimas noticias" className="mt-10">
          <h2 className="font-display text-3xl font-bold italic uppercase">
            Última <span className="text-azul">hora</span>
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