import { supabase } from "@/lib/supabase"

export interface CreditIcon {
  slug: string
  label: string
  dataUrl: string
}

// Los iconos propios se guardan como imagen PNG pequeña dentro de la propia base de datos
const DATA_URL = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/
const MAX_DATA_URL = 60_000

export function safeIconDataUrl(value: unknown): string | null {
  return typeof value === "string" && value.length <= MAX_DATA_URL && DATA_URL.test(value) ? value : null
}

function db() {
  if (!supabase) throw new Error("Supabase no está configurado (revisa .env.local)")
  return supabase
}

interface IconRow {
  slug: string
  label: string
  data_url: string
}

export async function fetchCreditIcons(): Promise<CreditIcon[]> {
  const { data, error } = await db().from("credit_icons").select("slug,label,data_url").order("label")
  if (error) throw error

  const list = Array.isArray(data) ? (data as IconRow[]) : []
  return list.flatMap((r) => {
    const dataUrl = safeIconDataUrl(r.data_url)
    return dataUrl ? [{ slug: r.slug, label: r.label, dataUrl }] : []
  })
}

export async function createCreditIcon(input: CreditIcon): Promise<void> {
  const { error } = await db()
    .from("credit_icons")
    .insert({ slug: input.slug, label: input.label, data_url: input.dataUrl })
  if (error) throw error
}

export async function deleteCreditIcon(slug: string): Promise<void> {
  const { error } = await db().from("credit_icons").delete().eq("slug", slug)
  if (error) throw error
}

export function iconErrorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const err = e as { code?: string; message?: string }
    if (err.code === "23505") return "Ya tienes un icono con ese nombre. Cambia el nombre."
    if (err.message) return err.message
  }
  return "Ha ocurrido un error. Inténtalo de nuevo."
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("No se ha podido leer la imagen."))
    img.src = src
  })
}

const SIZES = [128, 96, 64]

// Convierte el archivo en un PNG pequeño. Solo importa su forma: se pinta con el color del texto.
// Al pasar siempre por un PNG, nunca se guarda ni se muestra código de un SVG.
export async function fileToIconDataUrl(file: File): Promise<string> {
  if (!["image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
    throw new Error("Usa un archivo PNG, WebP o SVG con el fondo transparente.")
  }
  if (file.size > 1_000_000) throw new Error("El archivo pesa demasiado (máximo 1 MB).")

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    const w = img.naturalWidth || 128
    const h = img.naturalHeight || 128
    const isSvg = file.type === "image/svg+xml"

    for (const size of SIZES) {
      const scale = isSvg ? size / Math.max(w, h) : Math.min(1, size / Math.max(w, h))
      const cw = Math.max(1, Math.round(w * scale))
      const ch = Math.max(1, Math.round(h * scale))

      const canvas = document.createElement("canvas")
      canvas.width = cw
      canvas.height = ch
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) throw new Error("Tu navegador no puede procesar la imagen.")
      ctx.drawImage(img, 0, 0, cw, ch)

      const pixels = ctx.getImageData(0, 0, cw, ch).data
      let hasTransparency = false
      let hasContent = false
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 250) hasTransparency = true
        if (pixels[i] > 10) hasContent = true
        if (hasTransparency && hasContent) break
      }
      if (!hasContent) throw new Error("La imagen está vacía.")
      if (!hasTransparency) {
        throw new Error(
          "La imagen no tiene el fondo transparente: el icono se vería como un cuadrado. Usa una con el fondo transparente."
        )
      }

      const safe = safeIconDataUrl(canvas.toDataURL("image/png"))
      if (safe) return safe
    }
    throw new Error("El icono es demasiado complejo. Prueba con una imagen más sencilla.")
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}