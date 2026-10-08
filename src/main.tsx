import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@fontsource/barlow-condensed/700.css"
import "@fontsource/barlow-condensed/700-italic.css"
import "@fontsource/merriweather/400.css"
import "@fontsource/merriweather/700.css"
import "./index.css"
import App from "./App"
import ConsentProvider from "@/components/consents/consentProvider"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConsentProvider>
          <App />
        </ConsentProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
)