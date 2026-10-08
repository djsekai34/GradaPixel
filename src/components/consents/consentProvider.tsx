import { useCallback, useMemo, useState, type ReactNode } from "react"
import { readConsent, writeConsent } from "@/lib/consent"
import { ConsentContext, type Panel } from "./consent-context"

export default function ConsentProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readConsent)
  const [consent, setConsent] = useState(initial)
  const [panel, setPanel] = useState<Panel>(initial ? "closed" : "banner")

  const save = useCallback((videos: boolean) => {
    setConsent(writeConsent(videos))
    setPanel("closed")
  }, [])

  const value = useMemo(() => ({ consent, panel, setPanel, save }), [consent, panel, save])

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
}