import { useState } from "react"
import { Play } from "lucide-react"
import { useConsent } from "@/components/consents/consent-context"

const YOUTUBE_ID = /^[\w-]{11}$/

export default function VideoEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const { consent, setPanel } = useConsent()
  const [clicked, setClicked] = useState(false)

  if (!YOUTUBE_ID.test(youtubeId)) return null

  const allowed = consent?.videos === true || clicked

  if (!allowed) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 border border-border bg-card p-4 text-center text-foreground">
        <p className="font-display text-xl font-bold italic uppercase">{title}</p>
        <button
          type="button"
          onClick={() => setClicked(true)}
          className="inline-flex items-center gap-2 bg-brand px-5 py-2 font-display text-lg font-bold uppercase italic tracking-wide text-white transition-colors hover:bg-azul"
        >
          <Play size={18} aria-hidden="true" />
          Cargar este vídeo
        </button>
        <p className="max-w-md text-xs text-muted-foreground">
          Este vídeo es de YouTube (Google). Al pulsar «Cargar este vídeo» aceptas que YouTube pueda
          guardar cookies, solo para este vídeo. Para decidirlo de forma general, usa{" "}
          <button type="button" onClick={() => setPanel("settings")} className="underline">
            Configurar cookies
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}${clicked ? "?autoplay=1" : ""}`}
        title={title}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  )
}