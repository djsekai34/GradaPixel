import { useId } from "react"
import Credit from "@/components/articles/Credit"
import {
  detectPlatform,
  isPlatformChoice,
  platformInfo,
  platformOrder,
  type CreditPlatformChoice,
} from "@/lib/credit-platforms"
import { useCreditIcons } from "@/lib/queries"
import { safeExternalUrl } from "@/lib/url"
import { inputClass } from "./ui"

export interface CreditValue {
  text: string
  url: string
  platform: CreditPlatformChoice
}

interface Props {
  value: CreditValue
  onChange: (value: CreditValue) => void
  textLabel?: string
}

export default function CreditFields({
  value,
  onChange,
  textLabel = "Crédito: nombre o usuario (opcional)",
}: Props) {
  const uid = useId()
  const icons = useCreditIcons()

  const safe = safeExternalUrl(value.url)
  const urlInvalid = value.url.trim() !== "" && safe === null
  const detected = safe ? platformInfo[detectPlatform(safe)].label : null
  const hasPreview = value.text.trim() !== "" || safe !== null

  return (
    <div className="space-y-3 border border-border p-3">
      <div>
        <label htmlFor={`${uid}-text`} className="mb-1 block text-sm font-bold">
          {textLabel}
        </label>
        <input
          id={`${uid}-text`}
          value={value.text}
          maxLength={200}
          placeholder="u/usuario, @usuario, nombre del fotógrafo…"
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-url`} className="mb-1 block text-sm font-bold">
          Enlace del crédito (opcional)
        </label>
        <input
          id={`${uid}-url`}
          value={value.url}
          maxLength={500}
          placeholder="https://www.reddit.com/user/…"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          className={inputClass}
        />
        {urlInvalid && (
          <p role="alert" className="mt-1 text-sm text-destructive">
            El enlace debe empezar por https://
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-platform`} className="mb-1 block text-sm font-bold">
          Icono
        </label>
        <select
          id={`${uid}-platform`}
          value={value.platform}
          onChange={(e) => {
            const v = e.target.value
            if (isPlatformChoice(v)) onChange({ ...value, platform: v })
          }}
          className={inputClass}
        >
          <option value="auto">
            {detected ? `Automático (detectado: ${detected})` : "Automático (según el enlace)"}
          </option>
          <option value="none">Sin icono</option>
          {platformOrder.map((p) => (
            <option key={p} value={p}>
              {platformInfo[p].label}
            </option>
          ))}
          {icons.data && icons.data.length > 0 && (
            <optgroup label="Mis iconos">
              {icons.data.map((i) => (
                <option key={i.slug} value={`custom:${i.slug}`}>
                  {i.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Los iconos se ven en blanco con el modo oscuro y en negro con el modo claro. Puedes añadir
          los tuyos en el apartado «Iconos» del panel.
        </p>
      </div>

      {hasPreview ? (
        <div className="text-sm text-muted-foreground">
          <p className="mb-1 text-xs font-bold">Así se verá:</p>
          <Credit text={value.text} url={value.url} platform={value.platform} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Escribe un nombre o un enlace para que el crédito, y su icono, se vean. Con los dos campos
          vacíos no se muestra nada.
        </p>
      )}
    </div>
  )
}