import { useState } from "react"
import { Check, Link2 } from "lucide-react"

export default function ShareButtons({ title, url: shareUrl }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false)

  const url = shareUrl ?? window.location.href
  const text = encodeURIComponent(title)
  const link = encodeURIComponent(url)

  const networks = [
    { name: "X", href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${link}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Si el navegador no permite copiar, no hacemos nada
    }
  }

  const buttonClass =
    "border border-border px-3 py-1.5 font-display text-base font-bold uppercase italic tracking-wide transition-colors hover:border-azul hover:text-azul"

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-display text-base font-bold uppercase italic text-muted-foreground">
        Compartir
      </span>
      {networks.map((n) => (
        <a
          key={n.name}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
        >
          {n.name}
        </a>
      ))}
      <button type="button" onClick={copyLink} className={`${buttonClass} inline-flex items-center gap-1.5`}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
    </div>
  )
}