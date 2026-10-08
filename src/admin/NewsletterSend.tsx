import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { fetchNewsletterInfo, sendArticleNewsletter } from "@/lib/newsletter"
import { buttonClass } from "./ui"

interface Props {
  articleId: string
  published: boolean // si el artículo ya está publicado (guardado)
  dirty: boolean // si hay cambios sin guardar
}

export default function NewsletterSend({ articleId, published, dirty }: Props) {
  const queryClient = useQueryClient()
  const info = useQuery({
    queryKey: ["newsletter-info", articleId],
    queryFn: () => fetchNewsletterInfo(articleId),
  })
  const send = useMutation({
    mutationFn: () => sendArticleNewsletter(articleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["newsletter-info", articleId] })
    },
  })

  const data = info.data

  return (
    <fieldset className="space-y-3 border border-border p-4">
      <legend className="px-2 font-display text-xl font-bold italic uppercase">Newsletter</legend>

      {info.isPending && <p className="text-sm text-muted-foreground">Cargando…</p>}
      {info.isError && (
        <p role="alert" className="text-sm text-destructive">
          No se ha podido cargar el estado de la newsletter.
        </p>
      )}

      {data && (
        <>
          <p className="text-sm text-muted-foreground">
            {data.active} {data.active === 1 ? "suscriptor confirmado" : "suscriptores confirmados"}
            {data.pending > 0 ? ` · ${data.pending} pendientes de confirmar` : ""}.
          </p>

          {data.sentAt ? (
            <p className="text-sm">
              Aviso enviado el{" "}
              {format(new Date(data.sentAt), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}.
            </p>
          ) : !published ? (
            <p className="text-sm text-muted-foreground">
              Publica y guarda el artículo para poder avisar a los suscriptores.
            </p>
          ) : (
            <>
              {dirty && (
                <p className="text-sm text-muted-foreground">
                  Guarda los cambios antes de enviar, para que el correo lleve la última versión.
                </p>
              )}
              <button
                type="button"
                disabled={dirty || send.isPending || data.active === 0}
                onClick={() => {
                  if (
                    window.confirm(
                      `Se enviará un correo a ${data.active} suscriptores. No se puede deshacer ni repetir. ¿Continuar?`
                    )
                  ) {
                    send.mutate()
                  }
                }}
                className={buttonClass}
              >
                {send.isPending ? "Enviando…" : `Enviar aviso a ${data.active} suscriptores`}
              </button>
            </>
          )}

          {send.isSuccess && (
            <p role="status" className="text-sm">
              Enviado a {send.data.sent} suscriptores
              {send.data.failed > 0 ? `. No se pudo enviar a ${send.data.failed}.` : "."}
            </p>
          )}
          {send.isError && (
            <p role="alert" className="text-sm text-destructive">
              {send.error instanceof Error ? send.error.message : "No se ha podido enviar."}
            </p>
          )}
        </>
      )}
    </fieldset>
  )
}
