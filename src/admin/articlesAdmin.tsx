import { Link } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { deleteArticle, errorMessage, fetchAdminArticles, setArticleStatus } from "@/lib/api"
import { useCategories } from "@/lib/queries"
import { buttonClass, dangerButtonClass, primaryButtonClass } from "./ui"

export default function ArticlesAdmin() {
  const queryClient = useQueryClient()
  const articles = useQuery({ queryKey: ["admin-articles"], queryFn: fetchAdminArticles })
  const categories = useCategories()

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin-articles"] })
    void queryClient.invalidateQueries({ queryKey: ["admin-article"] })
    void queryClient.invalidateQueries({ queryKey: ["articles"] })
    void queryClient.invalidateQueries({ queryKey: ["article"] })
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" }) =>
      setArticleStatus(id, status),
    onSuccess: refresh,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: refresh,
  })

  const busy = statusMutation.isPending || deleteMutation.isPending
  const error = statusMutation.error ?? deleteMutation.error
  const categoryName = (slug: string) => categories.data?.find((c) => c.slug === slug)?.name ?? slug

  return (
    <section aria-label="Artículos">
      <title>Artículos | Administración</title>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-bold italic uppercase">Artículos</h1>
        <Link to="/admin/articulos/nuevo" className={primaryButtonClass}>
          Nuevo artículo
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errorMessage(error)}
        </p>
      )}

      {articles.isPending && <p className="mt-6 text-muted-foreground">Cargando…</p>}
      {articles.isError && (
        <p role="alert" className="mt-6 text-destructive">
          No se han podido cargar los artículos.
        </p>
      )}

      {articles.data && articles.data.length === 0 && (
        <p className="mt-6 font-serif text-muted-foreground">
          Todavía no hay artículos. Pulsa «Nuevo artículo» para escribir el primero.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {articles.data?.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 border border-border bg-card p-4"
          >
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-display text-2xl font-bold italic uppercase leading-tight">
                {a.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {categoryName(a.category)} ·{" "}
                {format(new Date(a.publishedAt ?? a.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
              </p>
            </div>

            <span
              className={`-skew-x-12 px-3 py-0.5 font-display text-sm font-bold uppercase italic ${
                a.status === "published" ? "bg-cat-futbol text-white" : "bg-muted text-foreground"
              }`}
            >
              {a.status === "published" ? "Publicado" : "Borrador"}
            </span>

            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/articulos/${a.id}`} className={buttonClass}>
                Editar
              </Link>
              <Link to={`/articulo/${a.slug}`} className={buttonClass}>
                Ver
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  statusMutation.mutate({
                    id: a.id,
                    status: a.status === "published" ? "draft" : "published",
                  })
                }
                className={buttonClass}
              >
                {a.status === "published" ? "Despublicar" : "Publicar"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`¿Borrar «${a.title}»? No se puede deshacer.`)) {
                    deleteMutation.mutate(a.id)
                  }
                }}
                className={dangerButtonClass}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}