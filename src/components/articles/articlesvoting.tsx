import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Rating } from "@/components/reui/rating"
import { ratingsEnabled } from "@/lib/supabase"
import { getMyVote, getRating, saveMyVote, vote } from "@/lib/ratings"

export default function ArticleVoting({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  const [myVote, setMyVote] = useState<number | null>(() => getMyVote(slug))

  const results = useQuery({
    queryKey: ["rating", slug],
    queryFn: () => getRating(slug),
    enabled: ratingsEnabled && myVote !== null,
  })

  const mutation = useMutation({
    mutationFn: (value: number) => vote(slug, value),
    onSuccess: (data, value) => {
      saveMyVote(slug, value)
      setMyVote(value)
      queryClient.setQueryData(["rating", slug], data)
    },
  })

  if (!ratingsEnabled) return null

  function handleVote(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 5) return
    mutation.mutate(value)
  }

  return (
    <section aria-label="Valoración de los lectores" className="mt-10 border-t border-border pt-6">
      <h2 className="font-display text-2xl font-bold italic uppercase">
        {myVote === null ? "¿Qué te ha parecido?" : "Gracias por votar"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {myVote === null
          ? "Pulsa una estrella para votar y ver la media de los lectores."
          : "Puedes cambiar tu voto cuando quieras."}
      </p>

      <div className="mt-3 flex items-center gap-3">
        <Rating rating={myVote ?? 0} editable onRatingChange={handleVote} />
        {mutation.isPending && <span className="text-sm text-muted-foreground">Enviando…</span>}
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          No se ha podido guardar tu voto. Inténtalo de nuevo.
        </p>
      )}

      {myVote !== null && (
        <div className="mt-6">
          <p className="font-display text-base font-bold uppercase italic text-muted-foreground">
            Media de los lectores
          </p>

          {results.isPending && <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>}

          {results.isError && (
            <p className="mt-2 text-sm text-muted-foreground">No se ha podido cargar la media.</p>
          )}

          {results.data && (
            <div
              className="mt-2 flex items-center gap-3"
              role="img"
              aria-label={`Media ${results.data.average} de 5 con ${results.data.votes} votos`}
            >
              <Rating rating={results.data.average} />
              <span className="font-display text-xl font-bold italic leading-none">
                {results.data.average.toFixed(1)}
                <span className="text-muted-foreground">/5</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {results.data.votes === 1 ? "1 voto" : `${results.data.votes} votos`}
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}