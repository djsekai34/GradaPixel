const clean = (value: string) => value.trim().replace(/\/+$/, "")

const siteUrl = clean(Deno.env.get("SITE_URL") ?? "")

export const env = {
  siteUrl,
  // Dirección del intermediario de envío (por defecto, el de tu propia web)
  relayUrl: clean(Deno.env.get("RELAY_URL") ?? "") || `${siteUrl}/api/send-email`,
  relaySecret: (Deno.env.get("RELAY_SECRET") ?? "").trim(),
  logoUrl: Deno.env.get("EMAIL_LOGO_URL") ?? "",
  senderName: Deno.env.get("SENDER_NAME") ?? "Grada Pixel",
  senderAddress: Deno.env.get("SENDER_ADDRESS") ?? "",
  supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
  allowedOrigins: (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map(clean)
    .filter(Boolean),
}