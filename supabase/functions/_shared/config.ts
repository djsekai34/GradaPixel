export const env = {
  siteUrl: (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, ""),
  // Dirección del intermediario de envío (por defecto, el de tu propia web)
  relayUrl:
    Deno.env.get("RELAY_URL") ??
    `${(Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, "")}/api/send-email`,
  relaySecret: Deno.env.get("RELAY_SECRET") ?? "",
  logoUrl: Deno.env.get("EMAIL_LOGO_URL") ?? "",
  senderName: Deno.env.get("SENDER_NAME") ?? "Grada Pixel",
  senderAddress: Deno.env.get("SENDER_ADDRESS") ?? "",
  supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
  allowedOrigins: (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
}