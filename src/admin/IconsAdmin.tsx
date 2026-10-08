import { useState, type ChangeEvent, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import IconMask from "@/components/articles/IconMask"
import {
  createCreditIcon,
  deleteCreditIcon,
  fileToIconDataUrl,
  iconErrorMessage,
} from "@/lib/credit-icons"
import { platformInfo, platformOrder } from "@/lib/credit-platforms"
import { useCreditIcons } from "@/lib/queries"
import { slugify } from "@/lib/slug"
import { dangerButtonClass, inputClass, primaryButtonClass } from "./ui"

function iconSlug(label: string): string {
  return slugify(label).slice(0, 40).replace(/-+$/, "")
}

// Muestra el icono sobre fondo claro y sobre fondo oscuro, como se verá en la web
function Swatches({ dataUrl }: { dataUrl: string }) {
  return (
    <div className="flex gap-2">
      <div className="flex size-14 items-center justify-center border border-border bg-white text-black">
        <IconMask dataUrl={dataUrl} className="size-8" />
      </div>
      <div className="flex size-14 items-center justify-center border border-border bg-black text-white">
        <IconMask dataUrl={dataUrl} className="size-8" />
      </div>
    </div>
  )
}

function NewIcon() {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState("")
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [inputKey, setInputKey] = useState(0)

  const slug = iconSlug(label)
  const valid = label.trim().length > 0 && label.trim().length <= 40 && slug.length > 0 && dataUrl !== null

  const create = useMutation({
    mutationFn: () => {
      if (!dataUrl) throw new Error("Elige primero una imagen.")
      return createCreditIcon({ slug, label: label.trim(), dataUrl })
    },
    onSuccess: () => {
      setLabel("")
      setDataUrl(null)
      setFileError(null)
      setInputKey((k) => k + 1) // vacía el selector de archivo
      void queryClient.invalidateQueries({ queryKey: ["credit-icons"] })
    },
  })

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setDataUrl(null)
    setFileError(null)
    if (!file) return

    setProcessing(true)
    try {
      setDataUrl(await fileToIconDataUrl(file))
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "No se ha podido procesar la imagen.")
    } finally {
      setProcessing(false)
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (valid) create.mutate()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-border bg-card p-4">
      <h2 className="font-display text-2xl font-bold italic uppercase">
        Añadir <span className="text-azul">icono</span>
      </h2>

      <div>
        <label htmlFor="icon-file" className="mb-1 block text-sm font-bold">
          Imagen (PNG, WebP o SVG con el fondo transparente)
        </label>
        <input
          key={inputKey}
          id="icon-file"
          type="file"
          accept="image/png,image/webp,image/svg+xml"
          onChange={(e) => void onFile(e)}
          className="block w-full text-sm file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Solo cuenta la forma del icono: se pintará de blanco o de negro según el modo, aunque la
          imagen original sea de colores.
        </p>
        {processing && <p className="mt-2 text-sm text-muted-foreground">Procesando…</p>}
        {fileError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {fileError}
          </p>
        )}
      </div>

      {dataUrl && (
        <div>
          <p className="mb-1 text-sm font-bold">Así se verá</p>
          <Swatches dataUrl={dataUrl} />
        </div>
      )}

      <div>
        <label htmlFor="icon-label" className="mb-1 block text-sm font-bold">
          Nombre del icono
        </label>
        <input
          id="icon-label"
          value={label}
          maxLength={40}
          placeholder="Pinterest, Mastodon, Steam…"
          onChange={(e) => setLabel(e.target.value)}
          className={inputClass}
        />
      </div>

      {create.isError && (
        <p role="alert" className="text-sm text-destructive">
          {iconErrorMessage(create.error)}
        </p>
      )}

      <button type="submit" disabled={!valid || create.isPending} className={primaryButtonClass}>
        {create.isPending ? "Añadiendo…" : "Añadir icono"}
      </button>
    </form>
  )
}

export default function IconsAdmin() {
  const queryClient = useQueryClient()
  const icons = useCreditIcons()

  const remove = useMutation({
    mutationFn: (slug: string) => deleteCreditIcon(slug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["credit-icons"] })
    },
  })

  return (
    <section aria-label="Iconos">
      <title>Iconos | Administración</title>
      <h1 className="font-display text-4xl font-bold italic uppercase">Iconos</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Son los iconos que acompañan al crédito de las fotos. Se ven en blanco con el modo oscuro y
        en negro con el modo claro. Después de añadir uno, lo eliges en el desplegable «Icono» del
        crédito, dentro de «Mis iconos».
      </p>

      <div className="mt-6">
        <NewIcon />
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold italic uppercase">
        Mis <span className="text-azul">iconos</span>
      </h2>

      {icons.isPending && <p className="mt-4 text-muted-foreground">Cargando…</p>}
      {icons.isError && (
        <p role="alert" className="mt-4 text-destructive">
          No se han podido cargar los iconos. ¿Has ejecutado el SQL de la tabla de iconos?
        </p>
      )}
      {icons.data && icons.data.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Todavía no has añadido ninguno.</p>
      )}

      {remove.isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {iconErrorMessage(remove.error)}
        </p>
      )}

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {icons.data?.map((i) => (
          <li key={i.slug} className="flex items-center gap-4 border border-border bg-card p-4">
            <Swatches dataUrl={i.dataUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl font-bold italic uppercase">{i.label}</p>
              <p className="truncate text-xs text-muted-foreground">custom:{i.slug}</p>
            </div>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => {
                if (
                  window.confirm(
`¿Borrar el icono «${i.label}»? Los créditos que lo usen se verán con el icono genérico de web.`                  )
                ) {
                  remove.mutate(i.slug)
                }
              }}
              className={dangerButtonClass}
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-2xl font-bold italic uppercase">
        Iconos <span className="text-azul">incluidos</span>
      </h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {platformOrder.map((p) => {
          const { Icon, label } = platformInfo[p]
          return (
            <li key={p} className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
              <Icon className="size-4 text-foreground" aria-hidden="true" />
              {label}
            </li>
          )
        })}
      </ul>
    </section>
  )
}