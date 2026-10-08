import type { IconType } from "react-icons"
import { LuGlobe } from "react-icons/lu"
import {
  SiDiscord,
  SiFacebook,
  SiInstagram,
  SiReddit,
  SiTelegram,
  SiTiktok,
  SiTwitch,
  SiX,
  SiYoutube,
} from "react-icons/si"

export type CreditPlatform =
  | "reddit"
  | "x"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "twitch"
  | "discord"
  | "telegram"
  | "web"

// Icono propio subido desde el panel: «custom:» + su identificador
export type CustomIconChoice = `custom:${string}`

// auto = según el enlace; none = sin icono
export type CreditPlatformChoice = CreditPlatform | "auto" | "none" | CustomIconChoice

// Todos los iconos usan el color del texto: blanco con el modo oscuro y negro con el modo claro
const ICON_COLOR = "text-foreground"

export const platformInfo: Record<CreditPlatform, { label: string; Icon: IconType; color: string }> = {
  reddit: { label: "Reddit", Icon: SiReddit, color: ICON_COLOR },
  x: { label: "X (Twitter)", Icon: SiX, color: ICON_COLOR },
  instagram: { label: "Instagram", Icon: SiInstagram, color: ICON_COLOR },
  youtube: { label: "YouTube", Icon: SiYoutube, color: ICON_COLOR },
  tiktok: { label: "TikTok", Icon: SiTiktok, color: ICON_COLOR },
  facebook: { label: "Facebook", Icon: SiFacebook, color: ICON_COLOR },
  twitch: { label: "Twitch", Icon: SiTwitch, color: ICON_COLOR },
  discord: { label: "Discord", Icon: SiDiscord, color: ICON_COLOR },
  telegram: { label: "Telegram", Icon: SiTelegram, color: ICON_COLOR },
  web: { label: "Web", Icon: LuGlobe, color: ICON_COLOR },
}

export const platformOrder = Object.keys(platformInfo) as CreditPlatform[]

const CUSTOM = /^custom:[a-z0-9]+(-[a-z0-9]+)*$/

export function isCustomChoice(value: string): value is CustomIconChoice {
  return value.length <= 47 && CUSTOM.test(value)
}

export function customSlug(choice: string): string | null {
  return isCustomChoice(choice) ? choice.slice("custom:".length) : null
}

export function isPlatformChoice(value: unknown): value is CreditPlatformChoice {
  return (
    value === "auto" ||
    value === "none" ||
    (typeof value === "string" && (Object.hasOwn(platformInfo, value) || isCustomChoice(value)))
  )
}

const HOSTS: [CreditPlatform, string[]][] = [
  ["reddit", ["reddit.com", "redd.it"]],
  ["x", ["x.com", "twitter.com", "t.co"]],
  ["instagram", ["instagram.com"]],
  ["youtube", ["youtube.com", "youtu.be"]],
  ["tiktok", ["tiktok.com"]],
  ["facebook", ["facebook.com", "fb.com", "fb.me"]],
  ["twitch", ["twitch.tv"]],
  ["discord", ["discord.com", "discord.gg"]],
  ["telegram", ["t.me", "telegram.me"]],
]

export function detectPlatform(url: string): CreditPlatform {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "")
    for (const [platform, domains] of HOSTS) {
      if (domains.some((d) => host === d || host.endsWith(`.${d}`))) return platform
    }
  } catch {
    // Enlace no válido: se trata como una web cualquiera
  }
  return "web"
}

// Solo resuelve los iconos incluidos. Los iconos propios («custom:…») se buscan aparte.
export function resolvePlatform(choice: CreditPlatformChoice, url: string | null): CreditPlatform | null {
  if (choice === "none") return null
  if (choice === "auto") return url ? detectPlatform(url) : null
  if (isCustomChoice(choice)) return null
  return choice as CreditPlatform
}