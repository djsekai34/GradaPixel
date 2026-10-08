import { useId, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { subscribe } from "@/lib/newsletter"
import { site } from "@/lib/site"

interface Props {
  onSubscribed?: () => void
  onNavigate?: () => void // para cerrar el pop-up si pulsan el enlace de privacidad
}

export default function NewsletterForm({ onSubscribed, onNavigate }: Props) {
  const uid = useId()
  const [email, setEmail] = useState("")
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState("") // campo trampa para robots

  const mutation = useMutation({
    mutationFn: () => subscribe(email.trim(), consent, website),
    onSuccess: () => onSubscribed?.(),
  })

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (consent && email.trim()) mutation.mutate()
  }

  if (mutation.isSuccess) {
    return (
      <div role="status" className="border border-azul bg-azul/10 p-4 text-sm">
        <p className="font-bold">¡Casi listo!</p>
        <p className="mt-1">
          Te hemos enviado un correo a <strong>{email.trim()}</strong> para confirmar tu suscripción.
          Revisa también la carpeta de spam. Hasta que confirmes, no recibirás nada.
        </p>
      </div>
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

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          No rellenar
          <input
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-azul"
        />
        <span>
          Acepto recibir por correo avisos de nuevos artículos. <strong>Responsable:</strong>{" "}
          {site.owner}. <strong>Finalidad:</strong> enviarte la newsletter. <strong>Base legal:</strong>{" "}
          tu consentimiento; puedes darte de baja cuando quieras. Más información en la{" "}
          <Link to="/privacidad" onClick={onNavigate} className="text-azul underline">
            política de privacidad
          </Link>
          .
        </span>
      </label>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "No hemos podido completar la suscripción."}
        </p>
      )}

      <button
        type="submit"
        disabled={!consent || email.trim() === "" || mutation.isPending}
        className="bg-brand px-5 py-2 font-display text-base font-bold uppercase italic tracking-wide text-white transition-colors hover:bg-azul disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? "Enviando…" : "Suscribirme"}
      </button>
    </form>
  )
}
