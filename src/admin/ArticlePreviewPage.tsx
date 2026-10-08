import { useEffect, useState } from "react"
import ArticleView from "@/components/articles/articleView"
import PageMessage from "@/components/layout/pageMensaje"
import { useArticles } from "@/lib/queries"
import { PREVIEW_KEY, readPreview } from "./previewStore"

export default function ArticlePreviewPage() {
  const [article, setArticle] = useState(readPreview)
  const all = useArticles()

  // Si vuelves a pulsar «Vista previa» en el editor, esta pestaña se actualiza sola
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === PREVIEW_KEY || e.key === null) setArticle(readPreview())
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  if (!article) {
    return (
      <PageMessage title="Nada que previsualizar">
        <title>Vista previa | Grada Pixel</title>
        <meta name="robots" content="noindex, nofollow" />
        <p>Vuelve al editor y pulsa «Vista previa».</p>
      </PageMessage>
    )
  }

  return <ArticleView article={article} all={all.data ?? []} preview />
}