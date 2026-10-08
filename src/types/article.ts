import type { CreditPlatformChoice } from "@/lib/credit-platforms"

export type ContentBlock =
  | { type: "paragraph"; text: string } // antiguo: texto plano
  | { type: "richtext"; html: string } // texto con formato
  | { type: "heading"; text: string }
  | {
      type: "image"
      src: string
      alt: string
      caption?: string
      credit?: string
      creditUrl?: string
      creditPlatform?: CreditPlatformChoice
    }
  | { type: "video"; youtubeId: string; title: string; caption?: string }
  | { type: "upload-video"; src: string; title: string; caption?: string }
  | { type: "quote"; text: string; author?: string }

// Lo que necesitan las listas y tarjetas (sin el texto completo)
export interface ArticleSummary {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string // slug de la sección
  author: string
  status: "draft" | "published"
  featured: boolean
  publishedAt: string | null
  createdAt: string
  image: string | null
  imageAlt: string
  imageCredit: string | null
  imageCreditUrl: string | null
  imageCreditPlatform: CreditPlatformChoice
  imageFocusX: number // 0 a 100: qué parte de la portada se ve al recortarla
  imageFocusY: number
}

export interface Article extends ArticleSummary {
  content: ContentBlock[]
}
