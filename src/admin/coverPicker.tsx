import { useRef, type PointerEvent } from "react"
import Cover from "@/components/articles/cover"
import { safeUrl } from "@/lib/url"
import { buttonClass } from "./ui"

interface Props {
  src: string
  focusX: number
  focusY: number
  onChange: (x: number, y: number) => void
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)))

export default function CoverPicker({ src, focusX, focusY, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const url = safeUrl(src)
  if (!url) return null

  function setFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    onChange(
      clamp(((e.clientX - rect.left) / rect.width) * 100),
      clamp(((e.clientY - rect.top) / rect.height) * 100)
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold">Qué parte se ve</p>
        <p className="mb-2 text-xs text-muted-foreground">
          Pulsa o arrastra sobre la imagen para marcar el punto importante. Esa parte será la que
          se vea cuando la portada se recorte.
        </p>
        <div
          ref={ref}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setFromPointer(e)
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) setFromPointer(e)
          }}
          className="relative inline-block max-w-full cursor-crosshair touch-none select-none"
        >
          <img src={url} alt="" draggable={false} className="block h-auto max-h-80 w-auto max-w-full" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-azul/60 shadow"
            style={{ left: `${focusX}%`, top: `${focusY}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="focus-x" className="mb-1 block text-sm font-bold">
            Horizontal ({focusX}%)
          </label>
          <input
            id="focus-x"
            type="range"
            min={0}
            max={100}
            value={focusX}
            onChange={(e) => onChange(Number(e.target.value), focusY)}
            className="w-full accent-azul"
          />
        </div>
        <div>
          <label htmlFor="focus-y" className="mb-1 block text-sm font-bold">
            Vertical ({focusY}%)
          </label>
          <input
            id="focus-y"
            type="range"
            min={0}
            max={100}
            value={focusY}
            onChange={(e) => onChange(focusX, Number(e.target.value))}
            className="w-full accent-azul"
          />
        </div>
      </div>

      <button type="button" onClick={() => onChange(50, 50)} className={buttonClass}>
        Centrar
      </button>

      <div className="flex flex-wrap items-start gap-4">
        <div className="w-48">
          <p className="mb-1 text-xs font-bold">Así se verá en las tarjetas</p>
          <Cover src={url} alt="" focusX={focusX} focusY={focusY} variant="card" />
        </div>
        <div className="w-72 max-w-full">
          <p className="mb-1 text-xs font-bold">Así se verá en el artículo</p>
          <Cover src={url} alt="" focusX={focusX} focusY={focusY} variant="hero" />
        </div>
      </div>
    </div>
  )
}