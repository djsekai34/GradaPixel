import { createClient } from "jsr:@supabase/supabase-js@2"
import { env } from "../_shared/config.ts"
import { corsFor, json, UUID } from "../_shared/http.ts"
import { notifyArticle } from "../_shared/notify.ts"

const admin = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false },
})

Deno.serve(async (req) => {
  const cors = corsFor(req)
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405, cors)

  try {
    // Solo un administrador con sesión iniciada puede enviar
    const userClient = createClient(env.supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
      auth: { persistSession: false },
    })
    const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin")
    if (adminError || isAdmin !== true) return json({ error: "No autorizado." }, 403, cors)

    let raw: unknown
    try {
      raw = await req.json()
    } catch {
      return json({ error: "Petición no válida." }, 400, cors)
    }
    const articleId =
      typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).articleId : null
    if (typeof articleId !== "string" || !UUID.test(articleId)) {
      return json({ error: "Artículo no válido." }, 400, cors)
    }

    const result = await notifyArticle(admin, articleId)
    if (!result.ok) return json({ error: result.error }, result.status, cors)
    return json({ ok: true, sent: result.sent, failed: result.failed }, 200, cors)
  } catch (e) {
    console.error(e)
    return json({ error: "Ha ocurrido un error. Inténtalo de nuevo." }, 500, cors)
  }
})