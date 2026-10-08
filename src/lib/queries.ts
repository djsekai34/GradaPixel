import { useQuery } from "@tanstack/react-query"
import { fetchArticleBySlug, fetchCategories, fetchPublishedArticles } from "@/lib/api"
import { fetchCreditIcons } from "@/lib/credit-icons"

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  })
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: fetchPublishedArticles,
    staleTime: 60_000,
  })
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
    enabled: slug.length > 0,
  })
}

// Los iconos propios solo se piden cuando hace falta (un crédito que usa uno)
export function useCreditIcons(enabled = true) {
  return useQuery({
    queryKey: ["credit-icons"],
    queryFn: fetchCreditIcons,
    staleTime: 5 * 60_000,
    enabled,
  })
}