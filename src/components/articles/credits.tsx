import { platformInfo, resolvePlatform, type CreditPlatformChoice } from "@/lib/credit-platforms"
import { safeExternalUrl } from "@/lib/url"


interface Props {
  text?: string | null
  url?: string | null
  platform?: CreditPlatformChoice | null
  label?: string
}

export default function Credit({ text, url, platform = "auto", label = "Foto:" }: Props) {
  const name = text?.trim() ?? ""
  const href = safeExternalUrl(url)
  if (!name && !href) return null

  const resolved = resolvePlatform(platform ?? "auto", href)
  const info = resolved ? platformInfo[resolved] : null
  const shownName = name || (href ? new URL(href).hostname.replace(/^www\./, "") : "")

  // Si el crédito ya empieza por «Foto:», no se repite
  const showLabel = label !== "" && !/^(foto|imagen|fuente)\s*:/i.test(shownName)

  const content = (
    <>
      {info && <info.Icon className={`size-4 shrink-0 ${info.color}`} aria-hidden="true" />}
      <span>{shownName}</span>
    </>
  )

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5">
      {showLabel && <span>{label}</span>}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline underline-offset-2 hover:text-azul"
        >
          {content}
          <span className="sr-only">
            {info ? ` en ${info.label}` : ""} (se abre en una pestaña nueva)
          </span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5">{content}</span>
      )}
    </span>
  )
}