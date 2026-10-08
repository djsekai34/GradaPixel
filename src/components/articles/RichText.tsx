import { useMemo } from "react"
import { richTextClass, sanitizeRich } from "@/lib/richtext"

// El HTML se vuelve a limpiar aquí aunque ya viniera limpio: nunca se muestra nada sin pasar por el filtro
export default function RichText({ html }: { html: string }) {
  const safe = useMemo(() => sanitizeRich(html), [html])
  if (!safe) return null
  return <div className={richTextClass} dangerouslySetInnerHTML={{ __html: safe }} />
}
