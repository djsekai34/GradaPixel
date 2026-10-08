export type CategoryColor =
  | "rojo"
  | "verde"
  | "naranja"
  | "amarillo"
  | "morado"
  | "azul"
  | "marino"

// Clases completas y escritas tal cual, para que Tailwind las detecte
export const categoryColors: Record<CategoryColor, string> = {
  rojo: "bg-cat-lucha text-white",
  verde: "bg-cat-futbol text-white",
  naranja: "bg-cat-baloncesto text-white",
  amarillo: "bg-cat-motor text-black",
  morado: "bg-cat-videojuegos text-white",
  azul: "bg-azul text-white",
  marino: "bg-brand text-white",
}

export const colorOptions = Object.keys(categoryColors) as CategoryColor[]

export interface Category {
  slug: string
  name: string
  color: CategoryColor
  sortOrder: number
}

export function isCategoryColor(value: unknown): value is CategoryColor {
  return typeof value === "string" && Object.hasOwn(categoryColors, value)
}