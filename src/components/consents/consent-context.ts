import { createContext, useContext } from "react"
import type { Consent } from "@/lib/consent"

export type Panel = "closed" | "banner" | "settings"

export interface ConsentContextValue {
  consent: Consent | null // null = todavía no ha decidido
  panel: Panel
  setPanel: (panel: Panel) => void
  save: (videos: boolean) => void
}

export const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error("useConsent debe usarse dentro de ConsentProvider")
  return ctx
}