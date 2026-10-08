import { safeIconDataUrl } from "@/lib/credit-icons"

// Pinta la forma del icono con el color del texto (currentColor):
// blanco con el modo oscuro y negro con el modo claro, sea cual sea el color de la imagen original.
export default function IconMask({ dataUrl, className = "size-4" }: { dataUrl: string; className?: string }) {
  const safe = safeIconDataUrl(dataUrl)
  if (!safe) return null

  const image = `url("${safe}")`
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: image,
        maskImage: image,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  )
}