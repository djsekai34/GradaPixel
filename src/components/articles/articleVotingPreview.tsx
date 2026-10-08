import { useState } from "react"
import { Rating } from "@/components/reui/rating"

// Igual que la votación real, pero sin conexión a la base de datos: no guarda nada
export default function ArticleVotingPreview() {
  const [value, setValue] = useState(0)

  return (
    <section aria-label="Valoración de los lectores" className="mt-10 border-t border-border pt-6">
      <h2 className="font-display text-2xl font-bold italic uppercase">
        {value === 0 ? "¿Qué te ha parecido?" : "Gracias por votar"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {value === 0
          ? "Pulsa una estrella para votar y ver la media de los lectores."
          : "Puedes cambiar tu voto cuando quieras."}
      </p>

      <div className="mt-3">
        <Rating rating={value} editable onRatingChange={setValue} />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Vista previa: aquí los votos no se guardan.
      </p>
    </section>
  )
}