import { useState, type FormEvent } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory, deleteCategory, errorMessage, updateCategory } from "@/lib/api"
import {
  categoryColors,
  colorOptions,
  type Category,
  type CategoryColor,
} from "@/lib/categories"
import { useCategories } from "@/lib/queries"
import { isValidSlug, slugify } from "@/lib/slug"
import { buttonClass, dangerButtonClass, inputClass, primaryButtonClass } from "./ui"

function ColorPicker({
  value,
  onChange,
}: {
  value: CategoryColor
  onChange: (c: CategoryColor) => void
}) {
  return (
    <div role="radiogroup" aria-label="Color de la sección" className="flex flex-wrap gap-2">
      {colorOptions.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          title={c}
          onClick={() => onChange(c)}
          className={`size-7 -skew-x-12 ${categoryColors[c]} ${
            value === c ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
          }`}
        />
      ))}
    </div>
  )
}

function NewSection({ nextOrder }: { nextOrder: number }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [touched, setTouched] = useState(false)
  const [color, setColor] = useState<CategoryColor>("azul")

  const finalSlug = touched ? slug : slugify(name)
  const valid = name.trim().length > 0 && name.trim().length <= 40 && isValidSlug(finalSlug)

  const mutation = useMutation({
    mutationFn: () =>
      createCategory({ slug: finalSlug, name: name.trim(), color, sortOrder: nextOrder }),
    onSuccess: () => {
      setName("")
      setSlug("")
      setTouched(false)
      setColor("azul")
      void queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (valid) mutation.mutate()
  }

  return (
    <form onSubmit={onSubmit} className="border border-border bg-card p-4">
      <h2 className="font-display text-2xl font-bold italic uppercase">
        Nueva <span className="text-azul">sección</span>
      </h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="new-name" className="mb-1 block text-sm font-bold">
            Nombre
          </label>
          <input
            id="new-name"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="new-slug" className="mb-1 block text-sm font-bold">
            Dirección (URL)
          </label>
          <input
            id="new-slug"
            value={finalSlug}
            onChange={(e) => {
              setTouched(true)
              setSlug(slugify(e.target.value))
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Será /categoria/{finalSlug || "..."}. No se puede cambiar después.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-bold">Color</p>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {mutation.isError && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage(mutation.error)}
        </p>
      )}

      <button
        type="submit"
        disabled={!valid || mutation.isPending}
        className={`${primaryButtonClass} mt-4`}
      >
        {mutation.isPending ? "Creando…" : "Crear sección"}
      </button>
    </form>
  )
}

function SectionRow({ category }: { category: Category }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState<CategoryColor>(category.color)
  const [order, setOrder] = useState(String(category.sortOrder))

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["categories"] })
  }

  const save = useMutation({
    mutationFn: () =>
      updateCategory(category.slug, {
        name: name.trim(),
        color,
        sortOrder: Number.parseInt(order, 10) || 0,
      }),
    onSuccess: refresh,
  })
  const remove = useMutation({
    mutationFn: () => deleteCategory(category.slug),
    onSuccess: refresh,
  })

  const error = save.error ?? remove.error
  const busy = save.isPending || remove.isPending

  return (
    <li className="border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`inline-block -skew-x-12 px-3 py-0.5 font-display text-sm font-bold uppercase italic ${categoryColors[color]}`}
        >
          {name.trim() || category.name}
        </span>
        <span className="text-xs text-muted-foreground">/categoria/{category.slug}</span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_6rem]">
        <div>
          <label htmlFor={`name-${category.slug}`} className="mb-1 block text-sm font-bold">
            Nombre
          </label>
          <input
            id={`name-${category.slug}`}
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`order-${category.slug}`} className="mb-1 block text-sm font-bold">
            Orden
          </label>
          <input
            id={`order-${category.slug}`}
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-bold">Color</p>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {errorMessage(error)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || name.trim().length === 0}
          onClick={() => save.mutate()}
          className={buttonClass}
        >
          {save.isPending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm(`¿Borrar la sección «${category.name}»?`)) remove.mutate()
          }}
          className={dangerButtonClass}
        >
          Borrar
        </button>
      </div>
    </li>
  )
}

export default function SectionsAdmin() {
  const categories = useCategories()
  const nextOrder = (categories.data?.reduce((max, c) => Math.max(max, c.sortOrder), 0) ?? 0) + 1

  return (
    <section aria-label="Secciones">
      <title>Secciones | Administración</title>
      <h1 className="font-display text-4xl font-bold italic uppercase">Secciones</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Las secciones aparecen en el menú de la web, ordenadas de menor a mayor «Orden».
      </p>

      <div className="mt-6">
        <NewSection nextOrder={nextOrder} />
      </div>

      {categories.isPending && <p className="mt-6 text-muted-foreground">Cargando…</p>}
      {categories.isError && (
        <p role="alert" className="mt-6 text-destructive">
          No se han podido cargar las secciones.
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {categories.data?.map((c) => (
          <SectionRow key={c.slug} category={c} />
        ))}
      </ul>
    </section>
  )
}