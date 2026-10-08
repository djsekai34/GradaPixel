import { useId, useState, type FormEvent } from "react"
import { useMutation } from "@tanstack/react-query"
import NewsletterForm from "@/components/newsletter/NewsletterForm"
import { requestUnsubscribeLink } from "@/lib/newsletter"

function UnsubscribeRequest() {
  const uid = useId()
  const [email, setEmail] = useState("")
  const mutation = useMutation({ mutationFn: () => requestUnsubscribeLink(email.trim()) })

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (email.trim()) mutation.mutate()
  }

  if (mutation.isSuccess) {
    return (
      <p role="status" className="border border-azul bg-azul/10 p-4 text-sm">
        Si ese correo está suscrito, te hemos enviado un enlace para darte de baja. Revisa también
        la carpeta de spam.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1 block text-sm font-bold">
          Tu correo
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-azul"
        />
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "No se ha podido enviar el enlace."}
        </p>
      )}

      <button
        type="submit"
        disabled={email.trim() === "" || mutation.isPending}
        className="border border-foreground px-5 py-2 font-display text-base font-bold uppercase italic tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "Enviando…" : "Enviarme el enlace de baja"}
      </button>
    </form>
  )
}

export default function NewsletterPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <title>Newsletter | Grada Pixel</title>
      <meta name="description" content="Recibe un correo cada vez que publiquemos un artículo nuevo." />

      <h1 className="font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
        News<span className="text-azul">letter</span>
      </h1>
      <p className="mt-4 font-serif text-lg text-muted-foreground">
        Recibe un correo cuando publiquemos un artículo nuevo. Sin spam, y puedes darte de baja cuando
        quieras.
      </p>

      <section aria-labelledby="subscribe-title" className="mt-10 max-w-md">
        <h2 id="subscribe-title" className="font-display text-2xl font-bold italic uppercase">
          Suscribirme
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          ¿Te diste de baja y quieres volver? Suscríbete otra vez aquí. Te pediremos confirmar de nuevo
          tu correo.
        </p>
        <NewsletterForm />
      </section>

      <section aria-labelledby="unsubscribe-title" className="mt-12 max-w-md border-t border-border pt-8">
        <h2 id="unsubscribe-title" className="font-display text-2xl font-bold italic uppercase">
          Darme de baja
        </h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Escribe tu correo y te enviaremos un enlace para confirmar la baja. También encontrarás un
          enlace de baja al final de cada correo que te enviemos.
        </p>
        <UnsubscribeRequest />
      </section>
    </main>
  )
}
