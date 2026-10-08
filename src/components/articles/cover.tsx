interface Props {
  src: string
  alt: string
  focusX: number
  focusY: number
  variant: "card" | "hero"
  className?: string
}

const clamp = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50)

export default function Cover({ src, alt, focusX, focusY, variant, className = "" }: Props) {
  // Mismas proporciones para todas las portadas: se recortan, no se deforman
  const ratio = variant === "card" ? "aspect-video" : "aspect-video md:aspect-[2/1]"

  return (
    <img
      src={src}
      alt={alt}
      loading={variant === "card" ? "lazy" : undefined}
      decoding="async"
      className={`${ratio} w-full object-cover ${className}`}
      style={{ objectPosition: `${clamp(focusX)}% ${clamp(focusY)}%` }}
    />
  )
}