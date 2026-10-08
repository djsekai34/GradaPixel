import type { ReactNode } from "react"

export default function PageMessage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold italic uppercase md:text-5xl">{title}</h1>
      {children && <div className="mt-4 font-serif text-muted-foreground">{children}</div>}
    </main>
  )
}