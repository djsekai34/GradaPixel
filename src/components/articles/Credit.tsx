import type { ReactNode } from "react"
import { platformInfo, resolvePlatform, type CreditPlatformChoice } from "@/lib/credit-platforms"
import { useCreditIcons } from "@/lib/queries"
import { safeExternalUrl } from "@/lib/url"
import IconMask from "./IconMask"



interface Props {
  text?: string | null
  url?: string | null
  platform?: CreditPlatformChoice | null
  label?: string
}

export default function Credit({ text, url, platform = "auto", label = "Foto:" }: Props) {
  const choice = platform ?? "auto"
  const isCustom = choice.startsWith("custom:")
  const customId = isCustom ? choice.slice("custom:".length) : null
  const icons = useCreditIcons(isCustom)
  console.log("[Credit]", {
    choice,
    texto: text,
    enlace: url,
    estado: icons.status,
    encontrado: Boolean(customId && icons.data?.some((i) => i.slug === customId)),
  })
  const name = text?.trim() ?? ""
  const href = safeExternalUrl(url)
  if (!name && !href) return null

  const custom = customId ? icons.data?.find((i) => i.slug === customId) : undefined
  const resolved = isCustom ? null : resolvePlatform(choice, href)
  const info = resolved ? platformInfo[resolved] : null
  const FallbackIcon = platformInfo.web.Icon
  const iconLabel = custom?.label ?? info?.label ?? (isCustom ? "Web" : undefined)
  const shownName = name || (href ? new URL(href).hostname.replace(/^www\./, "") : "")

  // Si el crédito ya empieza por «Foto:», no se repite
  const showLabel = label !== "" && !/^(foto|imagen|fuente)\s*:/i.test(shownName)

  // Con un icono propio siempre hay hueco: el icono, un espacio mientras carga,
  // o el icono genérico de web si no se encuentra
  let iconNode: ReactNode = null
  if (custom) {
    iconNode = <IconMask dataUrl={custom.dataUrl} className="size-4 text-foreground" />
  } else if (isCustom) {
    iconNode = icons.isPending ? (
      <span aria-hidden="true" className="inline-block size-4 shrink-0" />
    ) : (
      <FallbackIcon className="size-4 shrink-0 text-foreground" aria-hidden="true" />
    )
  } else if (info) {
    iconNode = <info.Icon className={`size-4 shrink-0 ${info.color}`} aria-hidden="true" />
  }

  const content = (
    <>
      {iconNode}
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
            {iconLabel ? ` en ${iconLabel}` : ""} (se abre en una pestaña nueva)
          </span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5">{content}</span>
      )}
    </span>
  )
  
}