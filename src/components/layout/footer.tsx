import { Link } from "react-router-dom"
import { ArrowUp } from "lucide-react"
import { useConsent } from "@/components/consents/consent-context"
import { categoryColors } from "@/lib/categories"
import { platformInfo, platformOrder } from "@/lib/credit-platforms"
import { useCategories } from "@/lib/queries"
import { site } from "@/lib/site"
import { socialUrls } from "@/lib/social"
import { safeExternalUrl } from "@/lib/url"
import Logo from "./logo"
import XFollowButton from "./XFollowButton"

const linkClass = "text-sm text-muted-foreground transition-colors hover:text-azul"

const infoLinks = [
  { to: "/contacto", label: "Contacto" },
  { to: "/newsletter", label: "Newsletter" },
  { to: "/cookies", label: "Política de cookies" },
  { to: "/privacidad", label: "Política de privacidad" },
  { to: "/terminos", label: "Términos y condiciones de uso" },
]

function ColumnTitle({ children }: { children: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-bold italic uppercase">{children}</h2>
      <span aria-hidden="true" className="mt-1 block h-0.5 w-8 bg-azul" />
    </div>
  )
}

export default function Footer() {
  const { setPanel } = useConsent()
  const { data } = useCategories()
  const categories = data ?? []

  // X tiene su propio botón grande; el resto de redes, iconos pequeños
  const xUrl = safeExternalUrl(socialUrls.x)

  const social = platformOrder.flatMap((p) => {
    if (p === "x" && xUrl) return []
    const href = safeExternalUrl(socialUrls[p])
    return href ? [{ platform: p, href }] : []
  })

  function scrollToTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <footer className="mt-12 border-t border-border bg-card text-foreground">
      {/* Franja con los colores de los iconos del logo */}
      <div aria-hidden="true" className="grid h-1 grid-cols-5">
        <span className="bg-cat-lucha" />
        <span className="bg-cat-futbol" />
        <span className="bg-cat-baloncesto" />
        <span className="bg-cat-motor" />
        <span className="bg-cat-videojuegos" />
      </div>

      {/* Invitación a la newsletter */}
      <section aria-labelledby="footer-newsletter" className="bg-brand text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 md:flex-row md:items-center md:justify-between md:py-6">
          <div>
            <h2
              id="footer-newsletter"
              className="font-display text-2xl font-bold italic uppercase leading-none md:text-3xl"
            >
              No te pierdas <span className="text-azul">nada</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-white/80">
              Te avisamos por correo cuando publiquemos un artículo nuevo. Sin spam y con baja en un
              clic.
            </p>
          </div>
          <Link
            to="/newsletter"
            className="inline-flex items-center justify-center bg-white px-5 py-2 font-display text-base font-bold uppercase italic tracking-wide text-brand transition-colors hover:bg-azul hover:text-white"
          >
            Suscribirme
          </Link>
        </div>
      </section>

      {/* Columnas */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" aria-label={`${site.name}, inicio`} className="inline-block">
            <Logo className="h-20 w-auto md:h-24" />
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Tu periódico digital de videojuegos y deporte.
          </p>

          {xUrl && (
            <div className="mt-4">
              <XFollowButton href={xUrl} />
            </div>
          )}

          {social.length > 0 && (
            <ul aria-label="Redes sociales" className="mt-4 flex flex-wrap gap-2">
              {social.map(({ platform, href }) => {
                const { Icon, label } = platformInfo[platform]
                return (
                  <li key={platform}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${site.name} en ${label} (se abre en una pestaña nueva)`}
                      title={label}
                      className="inline-flex size-9 items-center justify-center border border-border text-foreground transition-colors hover:border-azul hover:text-azul"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <nav aria-label="Secciones del pie de página">
          <ColumnTitle>Secciones</ColumnTitle>
          <ul className="mt-3 space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/categoria/${c.slug}`}
                  className="group inline-flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block size-2.5 -skew-x-12 ${categoryColors[c.color]}`}
                  />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Información">
          <ColumnTitle>Información</ColumnTitle>
          <ul className="mt-3 space-y-2">
            {infoLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={linkClass}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button type="button" onClick={() => setPanel("settings")} className={linkClass}>
                Configurar cookies
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 font-display text-base font-bold italic uppercase tracking-wide text-foreground transition-colors hover:text-azul"
          >
            <ArrowUp size={16} aria-hidden="true" />
            Volver arriba
          </button>
        </div>
      </div>
    </footer>
  )
}