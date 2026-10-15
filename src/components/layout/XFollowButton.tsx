import { motion, useReducedMotion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { SiX } from "react-icons/si"

export default function XFollowButton({ href }: { href: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Síguenos en X (se abre en una pestaña nueva)"
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="group relative inline-flex w-fit items-center gap-2.5 overflow-hidden bg-foreground px-4 py-2 font-display text-lg font-bold italic uppercase leading-none tracking-wide text-background shadow-[0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_6px_20px_-6px_rgb(10_132_255/0.6)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
    >
      {/* Destello que cruza el botón al pasar el ratón */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-background/30 transition-transform duration-700 ease-out group-hover:translate-x-[500%] motion-reduce:hidden"
      />
      {/* Raya azul que se dibuja por debajo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-azul transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
      />

      <SiX
        className="size-5 shrink-0 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transition-none"
        aria-hidden="true"
      />
      <span>Síguenos en X</span>
      <ArrowUpRight
        className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
        aria-hidden="true"
      />
    </motion.a>
  )
}