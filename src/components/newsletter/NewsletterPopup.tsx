import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { useConsent } from "@/components/consents/consent-context"
import Logo from "@/components/layout/logo"
import { rememberPopup, shouldShowPopup } from "@/lib/newsletter-prefs"
import { supabase } from "@/lib/supabase"
import NewsletterForm from "./NewsletterForm"

const DELAY_MS = 15_000
const SCROLL_RATIO = 0.6

function isContentPage(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/articulo/") || pathname.startsWith("/categoria/")
}

export default function NewsletterPopup() {
  const { pathname } = useLocation()
  const { panel } = useConsent()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const shownRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  // No se muestra si el banner de cookies sigue abierto
  const eligible = supabase !== null && isContentPage(pathname) && panel === "closed" && !open

  useEffect(() => {
    if (!eligible || shownRef.current || !shouldShowPopup()) return

    function show() {
      if (shownRef.current) return
      shownRef.current = true
      setOpen(true)
    }
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_RATIO) show()
    }

    const timer = window.setTimeout(show, DELAY_MS)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [eligible])

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open])

  function handleClose() {
    rememberPopup(subscribed ? "subscribed" : "dismissed")
    setOpen(false)
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        // Pulsar en el fondo oscuro cierra el aviso
        if (e.target === e.currentTarget) dialogRef.current?.close()
      }}
      aria-labelledby="newsletter-title"
      className="m-auto max-h-[90vh] w-[min(92vw,28rem)] overflow-y-auto border-t-4 border-brand bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60"
    >
      <div className="p-6">
        <div className="flex justify-center">
          <Logo className="h-16 w-auto" />
        </div>
        <h2
          id="newsletter-title"
          className="mt-4 text-center font-display text-3xl font-bold italic uppercase leading-none"
        >
          No te pierdas <span className="text-azul">nada</span>
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Te avisamos por correo cuando publiquemos un artículo nuevo. Sin spam y con baja en un clic.
        </p>

        <div className="mt-5">
          <NewsletterForm
            onSubscribed={() => {
              setSubscribed(true)
              rememberPopup("subscribed")
            }}
            onNavigate={() => dialogRef.current?.close()}
          />
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            {subscribed ? "Cerrar" : "No, gracias"}
          </button>
        </div>
      </div>
    </dialog>
  )
}
