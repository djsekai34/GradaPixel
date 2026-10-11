import { useEffect, useRef } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { useCategories } from "@/lib/queries"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import Logo from "./logo"

export default function Header() {
  const { data } = useCategories()
  const categories = data ?? []
  const { pathname } = useLocation()
  const scrollerRef = useRef<HTMLDivElement>(null)

  // En el móvil el menú se desliza: la sección actual se centra sola
  useEffect(() => {
    const scroller = scrollerRef.current
    const active = scroller?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!scroller || !active) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    scroller.scrollTo({
      left: active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [pathname, categories.length])

  return (
    <header className="border-b border-border bg-background text-foreground">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4">
        <AnimatedThemeToggler className="absolute right-4 top-4 text-foreground" />

        <Link to="/" aria-label="Grada Pixel, inicio">
          <Logo className="h-16 w-auto md:h-24" />
        </Link>

        <nav
          aria-label="Secciones"
          className="relative -mx-4 w-[calc(100%+2rem)] md:mx-0 md:w-full"
        >
          <div
            ref={scrollerRef}
            className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ul className="mx-auto flex w-max items-center gap-x-6 px-6 md:w-auto md:flex-wrap md:justify-center md:gap-y-1 md:px-0">
              {categories.map((c) => (
                <li key={c.slug} className="shrink-0">
                  <NavLink
                    to={`/categoria/${c.slug}`}
                    className={({ isActive }) =>
                      `block whitespace-nowrap py-2 font-display text-lg font-bold italic uppercase tracking-wide ${
                        isActive ? "text-azul" : "text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    {c.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Degradados de los bordes: avisan de que se puede deslizar (solo en móvil) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-background to-transparent md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-background to-transparent md:hidden"
          />
        </nav>
      </div>
      <div className="h-1 bg-brand" />
    </header>
  )
}