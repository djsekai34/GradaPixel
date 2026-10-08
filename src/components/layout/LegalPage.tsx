import type { ReactNode } from "react"
import { site } from "@/lib/site"

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <title>{`${title} | ${site.name}`}</title>
      <h1 className="font-display text-4xl font-bold italic uppercase leading-none md:text-6xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Última actualización: {site.updated}</p>
      <div className="prose dark:prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:italic prose-a:text-azul mt-8 max-w-none font-serif">
        {children}
      </div>
    </main>
  )
}