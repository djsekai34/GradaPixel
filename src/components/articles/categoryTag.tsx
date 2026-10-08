import { Link } from "react-router-dom"
import { categoryColors } from "@/lib/categories"
import { useCategories } from "@/lib/queries"

export default function CategoryTag({ slug }: { slug: string }) {
  const { data } = useCategories()
  const category = data?.find((c) => c.slug === slug)
  if (!category) return null

  return (
    <Link
      to={`/categoria/${category.slug}`}
      className={`inline-block -skew-x-12 px-3 py-0.5 font-display text-sm font-bold uppercase italic tracking-wide transition-opacity hover:opacity-80 ${categoryColors[category.color]}`}
    >
      {category.name}
    </Link>
  )
}