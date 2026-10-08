export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")
}

export function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 120 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}