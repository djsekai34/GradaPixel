import emailjs, { EmailJSResponseStatus } from "@emailjs/browser"
import { z } from "zod"

export const contactReasons = [
  "Tengo una noticia o una pista",
  "Quiero corregir un error",
  "Quiero colaborar con Grada Pixel",
  "Publicidad y colaboraciones comerciales",
  "Otro motivo",
] as const

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre.").max(80, "Máximo 80 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo.")
    .email("Escribe un correo válido.")
    .max(254, "El correo es demasiado largo."),
  reason: z
    .string()
    .refine((v) => (contactReasons as readonly string[]).includes(v), "Elige un motivo."),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más (mínimo 10 caracteres).")
    .max(2000, "Máximo 2000 caracteres."),
  consent: z.boolean().refine((v) => v === true, "Debes aceptar la política de privacidad para enviar el mensaje."),
  website: z.string().optional(), // campo trampa para robots: las personas no lo ven
})

export type ContactValues = z.infer<typeof contactSchema>

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined

// Si faltan las claves, la web sigue funcionando y la página de contacto enseña el correo
export const contactEnabled = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export async function sendContactMessage(values: ContactValues): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    throw new Error("El formulario no está disponible ahora mismo.")
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: values.name,
        reply_to: values.email,
        subject: values.reason,
        message: values.message,
      },
      { publicKey: PUBLIC_KEY, blockHeadless: true }
    )
  } catch (e) {
    if (e instanceof EmailJSResponseStatus) {
      if (e.status === 429) {
        throw new Error("Estás enviando mensajes muy seguido. Espera un momento y vuelve a intentarlo.")
      }
      if (e.status === 451) {
        throw new Error("No hemos podido verificar tu navegador. Prueba con otro o escríbenos por correo.")
      }
    }
    throw new Error("No hemos podido enviar tu mensaje. Inténtalo de nuevo o escríbenos por correo.")
  }
}
