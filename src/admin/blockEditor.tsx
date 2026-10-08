import { useId, type ReactNode } from "react"
import { isHtmlEmpty } from "@/lib/richtext"
import { parseYoutubeId, safeUrl, YOUTUBE_ID } from "@/lib/url"
import type { EditorBlock } from "./blocks"
import CreditFields from "./CreditFields"
import MediaUpload from "./MediaUpload"
import RichTextEditor from "./RichTextEditor"
import { buttonClass, dangerButtonClass, inputClass } from "./ui"

const labels: Record<EditorBlock["type"], string> = {
  paragraph: "Párrafo",
  richtext: "Texto",
  heading: "Subtítulo",
  quote: "Cita",
  image: "Imagen",
  video: "Vídeo de YouTube",
  "upload-video": "Vídeo propio",
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
        {label}
      </label>
      {children}
    </div>
  )
}

function hasContent(b: EditorBlock): boolean {
  if (b.type === "richtext") return !isHtmlEmpty(b.html)
  if ("text" in b) return b.text.trim() !== ""
  if ("src" in b) return b.src !== ""
  return b.youtubeId !== ""
}

interface Props {
  block: EditorBlock
  index: number
  isFirst: boolean
  isLast: boolean
  onChange: (block: EditorBlock) => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
}

export default function BlockEditor({
  block,
  index,
  isFirst,
  isLast,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const uid = useId()
  let body: ReactNode = null

  switch (block.type) {
    case "paragraph":
      body = (
        <Field id={`${uid}-text`} label="Texto">
          <textarea
            id={`${uid}-text`}
            rows={6}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className={inputClass}
          />
        </Field>
      )
      break

    case "richtext":
      body = (
        <RichTextEditor
          label={`Texto del bloque ${index + 1}`}
          value={block.html}
          onChange={(html) => onChange({ ...block, html })}
        />
      )
      break

    case "heading":
      body = (
        <Field id={`${uid}-text`} label="Subtítulo">
          <input
            id={`${uid}-text`}
            value={block.text}
            maxLength={200}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            className={inputClass}
          />
        </Field>
      )
      break

    case "quote":
      body = (
        <div className="space-y-3">
          <Field id={`${uid}-text`} label="Cita">
            <textarea
              id={`${uid}-text`}
              rows={3}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${uid}-author`} label="Quién lo dice (opcional)">
            <input
              id={`${uid}-author`}
              value={block.author ?? ""}
              maxLength={120}
              onChange={(e) => onChange({ ...block, author: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      )
      break

    case "image": {
      const preview = safeUrl(block.src)
      body = (
        <div className="space-y-3">
          {preview && <img src={preview} alt="" className="max-h-48 w-auto" />}
          <MediaUpload kind="image" onUploaded={(url) => onChange({ ...block, src: url })} />
          <Field id={`${uid}-src`} label="O pega la dirección de una imagen (https://…)">
            <input
              id={`${uid}-src`}
              value={block.src}
              onChange={(e) => onChange({ ...block, src: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${uid}-alt`} label="Descripción de la imagen (obligatoria, para accesibilidad)">
            <input
              id={`${uid}-alt`}
              value={block.alt}
              maxLength={200}
              onChange={(e) => onChange({ ...block, alt: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${uid}-caption`} label="Pie de foto (opcional)">
            <input
              id={`${uid}-caption`}
              value={block.caption ?? ""}
              maxLength={300}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              className={inputClass}
            />
          </Field>
          <CreditFields
            textLabel="Crédito de la foto: nombre o usuario (opcional)"
            value={{
              text: block.credit ?? "",
              url: block.creditUrl ?? "",
              platform: block.creditPlatform ?? "auto",
            }}
            onChange={(v) =>
              onChange({ ...block, credit: v.text, creditUrl: v.url, creditPlatform: v.platform })
            }
          />
        </div>
      )
      break
    }

    case "video": {
      const valid = YOUTUBE_ID.test(block.youtubeId)
      body = (
        <div className="space-y-3">
          <Field id={`${uid}-yt`} label="Enlace del vídeo de YouTube">
            <input
              id={`${uid}-yt`}
              value={block.youtubeId}
              placeholder="https://www.youtube.com/watch?v=…"
              onChange={(e) => {
                const raw = e.target.value
                onChange({ ...block, youtubeId: parseYoutubeId(raw) ?? raw.trim() })
              }}
              className={inputClass}
            />
          </Field>
          {block.youtubeId !== "" && (
            <p className={`text-sm ${valid ? "text-muted-foreground" : "text-destructive"}`}>
              {valid
                ? `Vídeo reconocido (${block.youtubeId}).`
                : "No reconozco este enlace. Pega el enlace completo del vídeo."}
            </p>
          )}
          {valid && (
            <div className="aspect-video w-full max-w-md bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${block.youtubeId}`}
                title="Vista previa del vídeo"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          )}
          <Field id={`${uid}-title`} label="Título del vídeo (para accesibilidad)">
            <input
              id={`${uid}-title`}
              value={block.title}
              maxLength={200}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${uid}-caption`} label="Pie del vídeo (opcional)">
            <input
              id={`${uid}-caption`}
              value={block.caption ?? ""}
              maxLength={300}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      )
      break
    }

    case "upload-video": {
      const preview = safeUrl(block.src)
      body = (
        <div className="space-y-3">
          {preview && <video src={preview} controls preload="metadata" className="max-h-64 w-auto" />}
          <MediaUpload kind="video" onUploaded={(url) => onChange({ ...block, src: url })} />
          <Field id={`${uid}-title`} label="Título del vídeo (para accesibilidad)">
            <input
              id={`${uid}-title`}
              value={block.title}
              maxLength={200}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field id={`${uid}-caption`} label="Pie del vídeo (opcional)">
            <input
              id={`${uid}-caption`}
              value={block.caption ?? ""}
              maxLength={300}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      )
      break
    }
  }

  return (
    <li className="border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="-skew-x-12 bg-brand px-3 py-0.5 font-display text-sm font-bold uppercase italic text-white">
          {index + 1}. {labels[block.type]}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label={`Subir el bloque ${index + 1}`}
            className={buttonClass}
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label={`Bajar el bloque ${index + 1}`}
            className={buttonClass}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => {
              if (!hasContent(block) || window.confirm("¿Eliminar este bloque?")) onRemove()
            }}
            aria-label={`Eliminar el bloque ${index + 1}`}
            className={dangerButtonClass}
          >
            Eliminar
          </button>
        </div>
      </div>
      {body}
    </li>
  )
}
