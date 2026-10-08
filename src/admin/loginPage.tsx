import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import Logo from "@/components/layout/logo"
import { inputClass, primaryButtonClass } from "./ui"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) {
      setError("Supabase no está configurado.")
      return
    }
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (authError) {
      setError("Correo o contraseña incorrectos.")
      return
    }
    navigate("/admin", { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <title>Acceso | Grada Pixel</title>
      <meta name="robots" content="noindex, nofollow" />

      <div className="flex justify-center">
        <Logo className="h-24 w-auto" />
      </div>
      <h1 className="mt-6 text-center font-display text-3xl font-bold italic uppercase">
        Panel de <span className="text-azul">administración</span>
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-bold">
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-bold">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full`}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  )
}