import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/layout"
import PageMessage from "@/components/layout/pageMensaje"
import Home from "@/pages/home"
import ArticlePage from "@/pages/articlePage"
import CategoryPage from "@/pages/categorypages"
import CookiesPage from "@/pages/cookies"
import PrivacyPage from "@/pages/privacyPage"
import TermsPage from "@/pages/termsPage"
import ContactPage from "@/pages/contactPage"
import NewsletterPage from "@/pages/NewsletterPage"
import NewsletterTokenPage from "@/pages/NewsletterTokenPage"

// El panel de administración y la vista previa se cargan aparte: los lectores no descargan ese código
const AdminRoutes = lazy(() => import("@/admin/adminRoutes"))
const ArticlePreviewPage = lazy(() => import("@/admin/ArticlePreviewPage"))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articulo/:slug" element={<ArticlePage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="/terminos" element={<TermsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/newsletter/confirmar" element={<NewsletterTokenPage mode="confirm" />} />
        <Route path="/newsletter/baja" element={<NewsletterTokenPage mode="unsubscribe" />} />
        <Route
          path="/vista-previa"
          element={
            <Suspense fallback={<PageMessage title="Cargando…" />}>
              <ArticlePreviewPage />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<PageMessage title="Cargando…" />}>
            <AdminRoutes />
          </Suspense>
        }
      />
    </Routes>
  )
}
