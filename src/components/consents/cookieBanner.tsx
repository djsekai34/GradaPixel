import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useConsent } from "./consent-context"
import Logo from "@/components/layout/logo"

// Los tres botones comparten estilo a propósito: rechazar pesa lo mismo que aceptar
const buttonClass =
  "border border-foreground px-4 py-2 font-display text-base font-bold uppercase italic tracking-wide transition-colors hover:bg-foreground hover:text-background"

function Settings() {
  const { consent, save, setPanel } = useConsent()
  const [videos, setVideos] = useState(consent?.videos ?? false)

  return (
    <>
      <div className="mt-4 space-y-4">
        <div className="border border-border p-4">
          <div className="flex items-start gap-3">
            <input
              id="cookies-necessary"
              type="checkbox"
              checked
              disabled
              className="mt-1 size-4 accent-azul"
            />
            <label htmlFor="cookies-necessary" className="text-sm">
              <span className="block font-bold">Necesarias (siempre activas)</span>
              <span className="text-muted-foreground">
                Guardan tu modo claro u oscuro, tus votos, que hayas cerrado el aviso de la newsletter y esta misma elección. La web no
                funciona bien sin ellas y no recogen datos para publicidad.
              </span>
            </label>
          </div>
        </div>

        <div className="border border-border p-4">
          <div className="flex items-start gap-3">
            <input
              id="cookies-videos"
              type="checkbox"
              checked={videos}
              onChange={(e) => setVideos(e.target.checked)}
              className="mt-1 size-4 accent-azul"
            />
            <label htmlFor="cookies-videos" className="text-sm">
              <span className="block font-bold">Vídeos de YouTube</span>
              <span className="text-muted-foreground">
                Permite reproducir vídeos incrustados. YouTube (Google) puede guardar cookies en
                tu dispositivo. Si lo desactivas, cada vídeo te pedirá permiso antes de cargarse.
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => save(videos)} className={buttonClass}>
          Guardar mi elección
        </button>
        <button type="button" onClick={() => save(false)} className={buttonClass}>
          Rechazar todo
        </button>
        <button type="button" onClick={() => save(true)} className={buttonClass}>
          Aceptar todo
        </button>
        {consent && (
          <button
            type="button"
            onClick={() => setPanel("closed")}
            className="px-2 py-2 text-sm text-muted-foreground underline hover:text-foreground"
          >
            Cancelar
          </button>
        )}
      </div>
    </>
  )
}

export default function CookieBanner() {
  const { panel, save, setPanel } = useConsent()
  const ref = useRef<HTMLDivElement>(null)

  // Al abrir los ajustes desde el footer, el foco pasa al panel (accesibilidad)
  useEffect(() => {
    if (panel === "settings") ref.current?.focus()
  }, [panel])

  if (panel === "closed") return null

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto border-t-4 border-brand bg-background px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-foreground shadow-[0_-8px_30px_rgba(0,0,0,0.25)] outline-none"
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3">
          <Logo className="h-12 w-auto shrink-0 md:h-14" />
          <h2 id="cookie-title" className="font-display text-2xl font-bold italic uppercase">
            Tu <span className="text-azul">privacidad</span>
          </h2>
        </div>

        {panel === "banner" ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Usamos almacenamiento propio imprescindible para que la web funcione. Con tu permiso,
              también cargamos vídeos de YouTube, que pueden guardar cookies de Google. Puedes
              aceptar, rechazar o elegir. Más información en nuestra{" "}
              <Link to="/cookies" className="text-azul underline">
                política de cookies
              </Link>
              .
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => save(true)} className={buttonClass}>
                Aceptar todo
              </button>
              <button type="button" onClick={() => save(false)} className={buttonClass}>
                Rechazar todo
              </button>
              <button type="button" onClick={() => setPanel("settings")} className={buttonClass}>
                Configurar
              </button>
            </div>
          </>
        ) : (
          <Settings />
        )}
      </div>
    </div>
  )
}