// Aspecto de los campos de texto, listas y áreas de escritura de los formularios públicos
const base =
  "w-full border bg-field px-3 py-2.5 text-sm text-foreground outline-hidden transition-colors placeholder:text-muted-foreground"

export const fieldClass = `${base} border-field-border focus:border-azul focus:ring-2 focus:ring-azul/40`

// Con un error de validación
export const fieldInvalidClass = `${base} border-destructive focus:ring-2 focus:ring-destructive/40`