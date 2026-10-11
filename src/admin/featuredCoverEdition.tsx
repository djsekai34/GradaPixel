import { useRef, useState, type PointerEvent } from "react"
import { safeUrl } from "@/lib/url"
import MediaUpload from "./mediaupload"
import { buttonClass, inputClass } from "./ui"

export interface FeatureValue {
  image: string // vacío = usar la portada del artículo
  focusX: number
  focusY: number
}

interface Props {
  coverImage: string
  articleImages: { src: string; alt: string }[]
  value: FeatureValue
  onChange: (value: FeatureValue) => void
  isFeatured: boolean // si el artículo tiene marcada la casilla «Destacado»
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)))

// Imita el bloque destacado de la portada: foto, degradado azul y un título encima
function HeroSample({
  src,
  focusX,
  focusY,
  ratio,
}: {
  src: string
  focusX: number
  focusY: number
  ratio: string
}) {
  return (
    <div className={`relative isolate flex flex-col justify-end overflow-hidden bg-brand p-3 text-white ${ratio}`}>
      <img
        src={src}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover"
        style={{ objectPosition: `${focusX}% ${focusY}%` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-brand via-brand/70 to-transparent"
      />
      <p className="font-display text-lg font-bold italic uppercase leading-none [text-shadow:0_2px_12px_rgb(0_0_0/0.6)] md:text-2xl">
        Así se verá el título
      </p>
    </div>
  )
}

export default function FeatureCoverEditor({
  coverImage,
  articleImages,
  value,
  onChange,
  isFeatured,
}: Props) {
  const [custom, setCustom] = useState(value.image !== "")
  const boxRef = useRef<HTMLDivElement>(null)

  const effective = custom && value.image ? value.image : coverImage
  const src = safeUrl(effective)

  function setFromPointer(e: PointerEvent<HTMLDivElement>) {
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return
    onChange({
      ...value,
      focusX: clamp(((e.clientX - rect.left) / rect.width) * 100),
      focusY: clamp(((e.clientY - rect.top) / rect.height) * 100),
    })
  }

  // Cada imagen nueva empieza centrada
  function pick(url: string) {
    onChange({ image: url, focusX: 50, focusY: 50 })
  }

  // Imágenes entre las que elegir: la portada y las del propio artículo (sin repetir)
  const choices: { src: string; alt: string }[] = []
  if (safeUrl(coverImage)) choices.push({ src: coverImage, alt: "Portada del artículo" })
  for (const img of articleImages) {
    if (!choices.some((c) => c.src === img.src)) choices.push(img)
  }

  return (
    <fieldset className="space-y-4 border border-border p-4">
      <legend className="px-2 font-display text-xl font-bold italic uppercase">
        Imagen del destacado (inicio)
      </legend>
      <p className="text-sm text-muted-foreground">
        Es la foto que sale detrás del título cuando este artículo es el destacado de la portada de la
        web. Es <strong>independiente</strong> de la portada del artículo: lo que cambies aquí no
        mueve nada de lo demás.
      </p>

      {!isFeatured && (
        <p role="note" className="border border-azul bg-azul/10 px-3 py-2 text-sm">
          Este artículo no tiene marcada la casilla <strong>«Destacado»</strong> (arriba, junto a la
          dirección). Mientras no la marques, esta foto no se verá en el inicio.
        </p>
      )}

      <div role="radiogroup" aria-label="Qué foto usar" className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="feature-source"
            checked={!custom}
            onChange={() => {
              setCustom(false)
              onChange({ ...value, image: "" })
            }}
            className="size-4 accent-azul"
          />
          La misma que la portada del artículo (con su propio encuadre)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="feature-source"
            checked={custom}
            onChange={() => setCustom(true)}
            className="size-4 accent-azul"
          />
          Otra imagen
        </label>
      </div>

      {custom && (
        <div className="space-y-3">
          {choices.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-bold">Elegir entre las imágenes de este artículo</p>
              <ul className="flex flex-wrap gap-2">
                {choices.map((c, i) => (
                  <li key={`${i}-${c.src}`}>
                    <button
                      type="button"
                      onClick={() => pick(c.src)}
                      aria-label="Usar esta imagen en el destacado"
                      aria-pressed={value.image === c.src}
                      className={`block border-2 ${
                        value.image === c.src ? "border-azul" : "border-border hover:border-foreground"
                      }`}
                    >
                      <img src={c.src} alt="" className="h-16 w-auto" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <MediaUpload kind="image" onUploaded={pick} />

          <div>
            <label htmlFor="feature-image" className="mb-1 block text-sm font-bold">
              O pega la dirección de una imagen (https://…)
            </label>
            <input
              id="feature-image"
              value={value.image}
              onChange={(e) => onChange({ ...value, image: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {!src ? (
        <p className="text-sm text-muted-foreground">
          {custom
            ? "Elige o sube una imagen para ajustar su encuadre."
            : "Este artículo no tiene portada. Pon una portada arriba, o elige «Otra imagen»."}
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold">Qué parte se ve</p>
            <p className="mb-2 text-xs text-muted-foreground">
              Pulsa o arrastra sobre la imagen para marcar el punto importante. Esa parte será la que se
              vea cuando la foto se recorte en el inicio.
            </p>
            <div
              ref={boxRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId)
                setFromPointer(e)
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) setFromPointer(e)
              }}
              className="relative inline-block max-w-full cursor-crosshair touch-none select-none"
            >
              <img src={src} alt="" draggable={false} className="block h-auto max-h-72 w-auto max-w-full" />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-azul/60 shadow"
                style={{ left: `${value.focusX}%`, top: `${value.focusY}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="feature-x" className="mb-1 block text-sm font-bold">
                Horizontal ({value.focusX}%)
              </label>
              <input
                id="feature-x"
                type="range"
                min={0}
                max={100}
                value={value.focusX}
                onChange={(e) => onChange({ ...value, focusX: Number(e.target.value) })}
                className="w-full accent-azul"
              />
            </div>
            <div>
              <label htmlFor="feature-y" className="mb-1 block text-sm font-bold">
                Vertical ({value.focusY}%)
              </label>
              <input
                id="feature-y"
                type="range"
                min={0}
                max={100}
                value={value.focusY}
                onChange={(e) => onChange({ ...value, focusY: Number(e.target.value) })}
                className="w-full accent-azul"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...value, focusX: 50, focusY: 50 })}
            className={buttonClass}
          >
            Centrar
          </button>

          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-bold">Así se verá en el ordenador</p>
              <HeroSample src={src} focusX={value.focusX} focusY={value.focusY} ratio="aspect-[4/1]" />
            </div>
            <div className="max-w-xs">
              <p className="mb-1 text-xs font-bold">Así se verá en el móvil</p>
              <HeroSample src={src} focusX={value.focusX} focusY={value.focusY} ratio="aspect-[3/2]" />
            </div>
          </div>
        </div>
      )}
    </fieldset>
  )
}