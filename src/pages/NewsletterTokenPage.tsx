import { Link, useSearchParams } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { confirmSubscription, unsubscribe } from "@/lib/newsletter"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const copy = {
  confirm: {
    title: "Confirmar suscripción",
    intro: "Último paso: pulsa el botón para confirmar que quieres recibir por correo los avisos de nuevos artículos.",
    button: "Confirmar mi suscripción",
    done: "¡Suscripción confirmada! Te avisaremos cuando publiquemos algo nuevo.",
  },
  unsubscribe: {
    title: "Darme de baja",
    intro: "Último paso: pulsa el botón para dejar de recibir los avisos de nuevos artículos.",
    button: "Darme de baja",
    done: "Te has dado de baja. No volverás a recibir avisos.",
  },
} as const

export default function NewsletterTokenPage({ mode }: { mode: "confirm" | "unsubscribe" }) {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const valid = UUID.test(token)
  const text = copy[mode]

  const mutation = useMutation({
    mutationFn: () => (mode === "confirm" ? confirmSubscription(token) : unsubscribe(token)),
  })

  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <title>{`${text.title} | Grada Pixel`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />

      <h1 className="font-display text-4xl font-bold italic uppercase leading-none md:text-5xl">
        {text.title}
      </h1>

      {!valid ? (
        <p role="alert" className="mt-6 font-serif text-muted-foreground">
          Este enlace no es válido. Si lo has copiado, comprueba que está completo.
        </p>
      ) : mutation.isSuccess ? (
        <div role="status" className="mt-6">
          <p className="font-serif text-lg">{text.done}</p>
          {mode === "unsubscribe" && (
            <p className="mt-4 text-sm text-muted-foreground">
              ¿Ha sido un error?{" "}
              <Link to="/newsletter" className="text-azul underline">
                Vuelve a suscribirte
              </Link>
              .
            </p>
          )}
          <Link
            to="/"
            className="mt-6 inline-block font-display text-xl font-bold uppercase italic text-azul"
          >
            Ir a la portada
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 font-serif text-muted-foreground">{text.intro}</p>
          {mutation.isError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "No se ha podido completar."}
            </p>
          )}
          <button
            type="button"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className="mt-6 bg-brand px-6 py-2 font-display text-lg font-bold uppercase italic tracking-wide text-white transition-colors hover:bg-azul disabled:opacity-50"
          >
            {mutation.isPending ? "Un momento…" : text.button}
          </button>
        </>
      )}
    </main>
  )
}
