import { Route, Routes } from "react-router-dom"
import PageMessage from "@/components/layout/pageMensaje"
import AdminLayout from "./adminLayout"
import ArticleEditorPage from "./ArticleEditorPage"
import ArticlesAdmin from "./articlesAdmin"
import IconsAdmin from "./IconsAdmin"
import LoginPage from "./loginPage"
import RequireAdmin from "./requireAdmin"
import SectionsAdmin from "./SectionsAdmin"

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<ArticlesAdmin />} />
          <Route path="articulos/nuevo" element={<ArticleEditorPage />} />
          <Route path="articulos/:id" element={<ArticleEditorPage />} />
          <Route path="secciones" element={<SectionsAdmin />} />
          <Route path="iconos" element={<IconsAdmin />} />
          <Route path="*" element={<PageMessage title="No encontrado" />} />
        </Route>
      </Route>
    </Routes>
  )
}