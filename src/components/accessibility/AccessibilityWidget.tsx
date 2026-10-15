import { useEffect, useId, useRef, useState } from "react"
import { Accessibility, Minus, Plus, RotateCcw, X } from "lucide-react"
import {
  A11Y_DEFAULTS,
  TEXT_SCALES,
  applyA11y,
  isDefaultA11y,
  loadA11y,
  saveA11y,
  type A11ySettings,
} from "@/lib/accessibility"

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 border border-border p-3 text-left transition-colors hover:border-azul"
    >
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-6 w-11 shrink-0 border border-border transition-colors ${
          checked ? "bg-azul" : "bg-muted"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
    </button>
  )
}

const stepButton =
  "inline-flex size-10 items-center justify-center border border-border transition-colors hover:border-azul disabled:cursor-not-allowed disabled:opacity-40"

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(loadA11y)
  const panelId = useId()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Aplicar y guardar cada cambio
  useEffect(() => {
    applyA11y(settings)
    saveA11y(settings)
  }, [settings])

  // Al abrir, el foco pasa al panel (para quien navega con teclado o lector de pantalla)
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  // Escape cierra el panel y devuelve el foco al botón; pulsar fuera también lo cierra
  useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(e: PointerEvent) {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  function update<K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  const maxScale = TEXT_SCALES.length - 1

  return (
    <div className="print:hidden">
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="fixed bottom-20 right-4 z-40 max-h-[75vh] w-[min(92vw,22rem)] overflow-y-auto border-t-4 border-brand bg-background p-4 text-foreground shadow-2xl outline-none ring-1 ring-border"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id={titleId} className="font-display text-2xl font-bold italic uppercase leading-none">
              Accesibi<span className="text-azul">lidad</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                buttonRef.current?.focus()
              }}
              aria-label="Cerrar las opciones de accesibilidad"
              className={stepButton}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <div className="border border-border p-3">
              <p className="text-sm font-bold">Tamaño del texto</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Reducir el tamaño del texto"
                  disabled={settings.textScale === 0}
                  onClick={() => update("textScale", Math.max(0, settings.textScale - 1))}
                  className={stepButton}
                >
                  <Minus size={18} aria-hidden="true" />
                </button>
                <p aria-live="polite" className="min-w-20 text-center font-display text-2xl font-bold">
                  {TEXT_SCALES[settings.textScale]}%
                </p>
                <button
                  type="button"
                  aria-label="Aumentar el tamaño del texto"
                  disabled={settings.textScale === maxScale}
                  onClick={() => update("textScale", Math.min(maxScale, settings.textScale + 1))}
                  className={stepButton}
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <Switch
              label="Contraste alto"
              hint="Negro y blanco puros, bordes marcados."
              checked={settings.contrast === "high"}
              onChange={(v) => update("contrast", v ? "high" : "normal")}
            />
            <Switch
              label="Fuente más legible"
              hint="Letra pensada para leer mejor, sin cursivas ni mayúsculas."
              checked={settings.font === "legible"}
              onChange={(v) => update("font", v ? "legible" : "default")}
            />
            <Switch
              label="Más espacio"
              hint="Más separación entre líneas, letras y palabras."
              checked={settings.spacing === "wide"}
              onChange={(v) => update("spacing", v ? "wide" : "normal")}
            />
            <Switch
              label="Subrayar enlaces"
              hint="Todos los enlaces se ven subrayados."
              checked={settings.links === "underline"}
              onChange={(v) => update("links", v ? "underline" : "normal")}
            />
            <Switch
              label="Reducir animaciones"
              hint="Quita los movimientos y las transiciones."
              checked={settings.motion === "reduced"}
              onChange={(v) => update("motion", v ? "reduced" : "normal")}
            />
          </div>

          <button
            type="button"
            disabled={isDefaultA11y(settings)}
            onClick={() => setSettings(A11Y_DEFAULTS)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-foreground px-4 py-2 font-display text-base font-bold italic uppercase tracking-wide transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Restablecer todo
          </button>

          <p className="mt-3 text-xs text-muted-foreground">
            Tus ajustes se guardan en este navegador. El modo claro u oscuro se cambia con el botón de
            la cabecera.
          </p>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Opciones de accesibilidad"
        title="Accesibilidad"
        className="fixed bottom-4 right-4 z-40 inline-flex size-12 items-center justify-center bg-brand text-white shadow-lg ring-2 ring-foreground/70 transition-colors hover:bg-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
      >
        <Accessibility size={26} aria-hidden="true" />
      </button>
    </div>
  )
}