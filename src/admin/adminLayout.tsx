import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import Logo from "@/components/layout/logo"
import { buttonClass } from "./ui"

const navClass = ({ isActive }: { isActive: boolean }) =>
  `font-display text-lg font-bold italic uppercase tracking-wide ${
    isActive ? "text-azul" : "text-muted-foreground hover:text-foreground"
  }`

export default function AdminLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function signOut() {
    await supabase?.auth.signOut()
    queryClient.clear()
    navigate("/admin/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <meta name="robots" content="noindex, nofollow" />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/admin" aria-label="Panel de administración">
            <Logo className="h-12 w-auto" />
          </Link>
          <nav aria-label="Administración" className="flex gap-5">
            <NavLink to="/admin" end className={navClass}>
              Artículos
            </NavLink>
            <NavLink to="/admin/secciones" className={navClass}>
              Secciones
            </NavLink>
             <NavLink to="/admin/iconos" className={navClass}>
              Iconos
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground underline hover:text-foreground">
              Ver la web
            </Link>
            <button type="button" onClick={() => void signOut()} className={buttonClass}>
              Salir
            </button>
          </div>
        </div>
        <div className="h-1 bg-brand" />
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}