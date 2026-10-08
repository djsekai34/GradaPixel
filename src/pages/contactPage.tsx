import { Mail } from "lucide-react"
import ContactForm from "@/components/contact/ContactForm"
import { contactEnabled } from "@/lib/contact"
import { site } from "@/lib/site"

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <title>Contacto | Grada Pixel</title>
      <meta
        name="description"
        content="¿Tienes una noticia, una corrección o quieres colaborar con Grada Pixel? Escríbenos."
      />

      <h1 className="font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
        Con<span className="text-azul">tacto</span>
      </h1>
      <p className="mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
        ¿Tienes una noticia, una corrección o quieres colaborar con {site.name}? Escríbenos y te
        responderemos lo antes posible.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_18rem]">
        <section aria-label="Formulario de contacto">
          {contactEnabled ? (
            <ContactForm />
          ) : (
            <p className="border border-border bg-card p-5 font-serif text-muted-foreground">
              El formulario no está disponible ahora mismo. Escríbenos a{" "}
              <a href={`mailto:${site.email}`} className="text-azul underline">
                {site.email}
              </a>
              .
            </p>
          )}
        </section>

        <aside className="space-y-4">
          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold italic uppercase">
              Escríbenos <span className="text-azul">directamente</span>
            </h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-2 hover:text-azul"
            >
              <Mail size={16} aria-hidden="true" />
              {site.email}
            </a>
          </div>

          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-xl font-bold italic uppercase">
              Corregir un <span className="text-azul">error</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si has visto una errata en un artículo, indícanos el enlace y qué hay que cambiar.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
