import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, useReducedMotion } from "motion/react"
import { Check, Send } from "lucide-react"
import {
  contactReasons,
  contactSchema,
  sendContactMessage,
  type ContactValues,
} from "@/lib/contact"
import { site } from "@/lib/site"

const MESSAGE_MAX = 2000
const COOLDOWN_MS = 30_000

const baseInput =
  "w-full border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-azul"
const inputClass = (invalid: boolean) =>
  `${baseInput} ${invalid ? "border-destructive" : "border-border"}`

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block font-display text-base font-bold uppercase italic tracking-wide"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ContactForm() {
  const reduceMotion = useReducedMotion()
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", reason: "", message: "", consent: false, website: "" },
    mode: "onTouched",
  })

  const message = useWatch({ control, name: "message" })

  async function onSubmit(values: ContactValues) {
    setSendError(null)

    // Los robots rellenan el campo trampa: se les responde «ok» sin enviar nada
    if (values.website) {
      setSent(true)
      return
    }
    if (Date.now() < cooldownUntil) {
      setSendError("Espera unos segundos antes de enviar otro mensaje.")
      return
    }

    try {
      await sendContactMessage(values)
      setCooldownUntil(Date.now() + COOLDOWN_MS)
      reset()
      setSent(true)
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "No hemos podido enviar tu mensaje.")
    }
  }

  if (sent) {
    return (
      <motion.div
        role="status"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border border-azul bg-azul/10 p-6"
      >
        <div className="flex size-10 items-center justify-center bg-brand text-white">
          <Check size={22} aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-3xl font-bold italic uppercase leading-none">
          ¡Mensaje <span className="text-azul">enviado</span>!
        </h2>
        <p className="mt-2 font-serif">
          Gracias por escribirnos. Te responderemos al correo que nos has dado lo antes posible.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 border border-foreground px-5 py-2 font-display text-base font-bold uppercase italic tracking-wide transition-colors hover:bg-foreground hover:text-background"
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Nombre" error={errors.name?.message}>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={inputClass(Boolean(errors.name))}
            {...register("name")}
          />
        </Field>

        <Field id="contact-email" label="Correo" error={errors.email?.message}>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={inputClass(Boolean(errors.email))}
            {...register("email")}
          />
        </Field>
      </div>

      <Field id="contact-reason" label="Motivo" error={errors.reason?.message}>
        <select
          id="contact-reason"
          aria-invalid={Boolean(errors.reason)}
          aria-describedby={errors.reason ? "contact-reason-error" : undefined}
          className={inputClass(Boolean(errors.reason))}
          {...register("reason")}
        >
          <option value="">Elige un motivo</option>
          {contactReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <Field id="contact-message" label="Mensaje" error={errors.message?.message}>
        <textarea
          id="contact-message"
          rows={7}
          maxLength={MESSAGE_MAX}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={inputClass(Boolean(errors.message))}
          {...register("message")}
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {message?.length ?? 0}/{MESSAGE_MAX}
        </p>
      </Field>

      {/* Campo trampa: oculto para las personas */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          No rellenar
          <input tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "contact-consent-error" : undefined}
            className="mt-0.5 size-4 shrink-0 accent-azul"
            {...register("consent")}
          />
          <span>
            He leído la{" "}
            <Link to="/privacidad" className="text-azul underline">
              política de privacidad
            </Link>{" "}
            y acepto que {site.name} use mis datos para responder a mi mensaje.
          </span>
        </label>
        {errors.consent && (
          <p id="contact-consent-error" role="alert" className="mt-1 text-sm text-destructive">
            {errors.consent.message}
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          <strong>Responsable:</strong> {site.owner}. <strong>Finalidad:</strong> responder a tu
          mensaje. <strong>Base legal:</strong> tu consentimiento. <strong>Destinatarios:</strong>{" "}
          EmailJS, el servicio que envía el mensaje a nuestro correo. <strong>Derechos:</strong> puedes
          acceder, rectificar o suprimir tus datos escribiéndonos.
        </p>
      </div>

      {sendError && (
        <p role="alert" className="text-sm text-destructive">
          {sendError}{" "}
          <a href={`mailto:${site.email}`} className="underline">
            {site.email}
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 bg-brand px-6 py-2.5 font-display text-lg font-bold uppercase italic tracking-wide text-white transition-colors hover:bg-azul disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send size={18} aria-hidden="true" />
        {isSubmitting ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  )
}
