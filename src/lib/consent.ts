export interface Consent {
  version: number
  videos: boolean
  savedAt: number
}

export const CONSENT_KEY = "gp-cookie-consent"
// Súbela cuando añadas una categoría nueva: se volverá a preguntar a todos
export const CONSENT_VERSION = 1
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 730 // unos 24 meses

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null

    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null) return null

    const c = data as Partial<Consent>
    if (c.version !== CONSENT_VERSION) return null
    if (typeof c.videos !== "boolean" || typeof c.savedAt !== "number") return null
    if (Date.now() - c.savedAt > MAX_AGE_MS) return null

    return { version: c.version, videos: c.videos, savedAt: c.savedAt }
  } catch {
    return null
  }
}

export function writeConsent(videos: boolean): Consent {
  const consent: Consent = { version: CONSENT_VERSION, videos, savedAt: Date.now() }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  } catch {
    // Si el navegador no deja guardar, la elección vale solo durante esta visita
  }
  return consent
}