export const env = {
  siteUrl: (Deno.env.get("SITE_URL") ?? "").replace(/\/+$/, ""),
  resendKey: Deno.env.get("RESEND_API_KEY") ?? "",
  from: Deno.env.get("NEWSLETTER_FROM") ?? "",
  replyTo: Deno.env.get("NEWSLETTER_REPLY_TO") ?? "",
  logoUrl: Deno.env.get("EMAIL_LOGO_URL") ?? "",
  senderName: Deno.env.get("SENDER_NAME") ?? "Grada Pixel",
  senderAddress: Deno.env.get("SENDER_ADDRESS") ?? "",
  supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
  allowedOrigins: (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
}
