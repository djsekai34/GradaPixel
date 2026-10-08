import { Outlet } from "react-router-dom"
import Header from "./header"
import Footer from "./footer"
import ScrollToTop from "./scrollToTop"
import CookieBanner from "@/components/consents/cookieBanner"
import NewsletterPopup from "@/components/newsletter/NewsletterPopup"

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <Header />
      <Outlet />
      <Footer />
      <CookieBanner />
      <NewsletterPopup />
    </div>
  )
}
