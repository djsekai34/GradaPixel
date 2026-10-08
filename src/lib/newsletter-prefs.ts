const KEY = "gp-newsletter"
const REMIND_AFTER_MS = 30 * 24 * 3600 * 1000 // si lo cierras, vuelve a los 30 días

export function shouldShowPopup(): boolean {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return true
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return true
    const d = parsed as { state?: unknown; at?: unknown }

    if (d.state === "subscribed") return false
    if (d.state === "dismissed" && typeof d.at === "number" && Date.now() - d.at < REMIND_AFTER_MS) {
      return false
    }
    return true
  } catch {
    return true
  }
}

export function rememberPopup(state: "subscribed" | "dismissed"): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ state, at: Date.now() }))
  } catch {
    // Si el navegador no deja guardar, el aviso solo se muestra una vez por visita
  }
}
