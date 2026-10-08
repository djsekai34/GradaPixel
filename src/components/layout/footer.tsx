import { Link } from "react-router-dom"
import { site } from "@/lib/site"
import { useConsent } from "@/components/consents/consent-context"

const links = [
  { to: "/newsletter", label: "Newsletter" },
  { to: "/cookies", label: "Política de cookies" },
  { to: "/privacidad", label: "Política de privacidad" },
  { to: "/terminos", label: "Términos y condiciones de uso" },
  { to: "/contacto", label: "Contacto" },
]

const linkClass =
  "font-display text-base font-bold uppercase italic tracking-wide text-muted-foreground transition-colors hover:text-azul"

export default function Footer() {
  const { setPanel } = useConsent()

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Información legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </Link>
          ))}
          <button type="button" onClick={() => setPanel("settings")} className={linkClass}>
            Configurar cookies
          </button>
        </nav>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
