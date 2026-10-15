export const TEXT_SCALES = [100, 112.5, 125, 150] as const

export interface A11ySettings {
  textScale: number // posición en TEXT_SCALES (0 = normal)
  contrast: "normal" | "high"
  font: "default" | "legible"
  spacing: "normal" | "wide"
  links: "normal" | "underline"
  motion: "normal" | "reduced"
}

export const A11Y_DEFAULTS: A11ySettings = {
  textScale: 0,
  contrast: "normal",
  font: "default",
  spacing: "normal",
  links: "normal",
  motion: "normal",
}

const KEY = "gp-accessibility"

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function isDefaultA11y(s: A11ySettings): boolean {
  return (Object.keys(A11Y_DEFAULTS) as (keyof A11ySettings)[]).every((k) => s[k] === A11Y_DEFAULTS[k])
}

// Se revisa todo al leerlo: si el dato guardado no es válido, se usan los valores normales
export function loadA11y(): A11ySettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return A11Y_DEFAULTS

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null) return A11Y_DEFAULTS
    const o = parsed as Record<string, unknown>

    const scale =
      typeof o.textScale === "number" &&
      Number.isInteger(o.textScale) &&
      o.textScale >= 0 &&
      o.textScale < TEXT_SCALES.length
        ? o.textScale
        : 0

    return {
      textScale: scale,
      contrast: pick(o.contrast, ["normal", "high"] as const, "normal"),
      font: pick(o.font, ["default", "legible"] as const, "default"),
      spacing: pick(o.spacing, ["normal", "wide"] as const, "normal"),
      links: pick(o.links, ["normal", "underline"] as const, "normal"),
      motion: pick(o.motion, ["normal", "reduced"] as const, "normal"),
    }
  } catch {
    return A11Y_DEFAULTS
  }
}

export function saveA11y(s: A11ySettings): void {
  try {
    if (isDefaultA11y(s)) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // Sin almacenamiento, los ajustes valen solo durante esta visita
  }
}

function setFlag(el: HTMLElement, name: string, value: string | null) {
  if (value === null) el.removeAttribute(name)
  else el.setAttribute(name, value)
}

// Los ajustes se aplican como atributos en <html>; el CSS hace el resto
export function applyA11y(s: A11ySettings): void {
  const el = document.documentElement
  el.style.fontSize = s.textScale > 0 ? `${TEXT_SCALES[s.textScale]}%` : ""
  setFlag(el, "data-contrast", s.contrast === "high" ? "high" : null)
  setFlag(el, "data-font", s.font === "legible" ? "legible" : null)
  setFlag(el, "data-spacing", s.spacing === "wide" ? "wide" : null)
  setFlag(el, "data-links", s.links === "underline" ? "underline" : null)
  setFlag(el, "data-motion", s.motion === "reduced" ? "reduced" : null)
}