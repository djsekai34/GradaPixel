import { Navigate, Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { checkIsAdmin } from "@/lib/api"
import PageMessage from "@/components/layout/pageMensaje"
import { useSession } from "./uiSession"
import { buttonClass } from "./ui"

export default function RequireAdmin() {
  const session = useSession()
  const adminQuery = useQuery({
    queryKey: ["is-admin", session?.user.id],
    queryFn: checkIsAdmin,
    enabled: Boolean(session),
  })

  if (session === undefined) return <PageMessage title="Cargando…" />
  if (session === null) return <Navigate to="/admin/login" replace />
  if (adminQuery.isPending) return <PageMessage title="Comprobando acceso…" />

  if (adminQuery.isError || !adminQuery.data) {
    return (
      <PageMessage title="Sin acceso">
        <p>Esta cuenta no tiene permisos de administrador.</p>
        <button
          type="button"
          className={`${buttonClass} mt-6`}
          onClick={() => {
            void supabase?.auth.signOut()
          }}
        >
          Cerrar sesión
        </button>
      </PageMessage>
    )
  }

  return <Outlet />
}