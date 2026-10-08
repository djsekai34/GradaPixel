import { Link, NavLink } from "react-router-dom"
import { useCategories } from "@/lib/queries"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import Logo from "./logo"

export default function Header() {
  const { data } = useCategories()
  const categories = data ?? []

  return (
    <header className="border-b border-border bg-background text-foreground">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-4">
        <AnimatedThemeToggler className="absolute right-4 top-4 text-foreground" />

        <Link to="/" aria-label="Grada Pixel, inicio">
          <Logo className="h-16 w-auto md:h-24" />
        </Link>

        <nav aria-label="Secciones" className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          {categories.map((c) => (
            <NavLink
              key={c.slug}
              to={`/categoria/${c.slug}`}
              className={({ isActive }) =>
                `font-display text-lg font-bold italic uppercase tracking-wide ${
                  isActive ? "text-azul" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {c.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="h-1 bg-brand" />
    </header>
  )
}