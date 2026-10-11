// Añade las etiquetas de previsualización (Open Graph y Twitter) al HTML de cada artículo.
// Los programas de X, WhatsApp o Facebook no ejecutan JavaScript: necesitan verlas en el HTML.

const SITE_NAME = "Grada Pixel"
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function shorten(text, max) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim()
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t
}

function httpsUrl(value) {
  try {
    const u = new URL(String(value))
    return u.protocol === "https:" ? u.href : null
  } catch {
    return null
  }
}

async function getArticle(slug) {
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) return null

  // Con la clave pública, las reglas de la base de datos solo devuelven artículos publicados
  const url =
    `${base}/rest/v1/articles` +
    `?select=title,excerpt,image_url,image_alt,published_at` +
    `&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`

  const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

function buildTags({ title, description, url, image, imageAlt, published }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const u = escapeHtml(url)
  const i = escapeHtml(image)
  const a = escapeHtml(imageAlt)

  const lines = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${u}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">`,
    `<meta property="og:locale" content="es_ES">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${u}">`,
    `<meta property="og:image" content="${i}">`,
    `<meta property="og:image:alt" content="${a}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="twitter:image" content="${i}">`,
    `<meta name="twitter:image:alt" content="${a}">`,
  ]

  if (published) {
    lines.push(`<meta property="article:published_time" content="${escapeHtml(published)}">`)
  }
  return lines.join("\n    ")
}

// Quita las etiquetas por defecto del index.html y pone las del artículo
function inject(html, tags) {
  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+(?:property|name)=["'](?:og:[^"']*|twitter:[^"']*|description)["'][^>]*>\s*/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "")

  return cleaned.replace(/<\/head>/i, () => `    ${tags}\n  </head>`)
}

export default async function handler(req, res) {
  const raw = Array.isArray(req.query?.slug) ? req.query.slug[0] : req.query?.slug
  const slug = typeof raw === "string" ? raw : ""
  const origin = `https://${req.headers.host}`

  let html
  try {
    const page = await fetch(`${origin}/index.html`)
    if (!page.ok) throw new Error(`index.html ${page.status}`)
    html = await page.text()
  } catch (e) {
    console.error("No se pudo cargar index.html", e)
    res.status(500).send("No se ha podido cargar la página.")
    return
  }

  let article = null
  if (SLUG.test(slug)) {
    try {
      article = await getArticle(slug)
    } catch (e) {
      console.error("No se pudo leer el artículo", e)
    }
  }

  let out = html
  if (article) {
    const title = `${shorten(article.title, 90)} | ${SITE_NAME}`
    const description = shorten(article.excerpt, 200) || `Lee este artículo en ${SITE_NAME}.`
    const image = httpsUrl(article.image_url) || `${origin}/og-default.png`
    const imageAlt = shorten(article.image_alt, 200) || article.title

    let published = null
    const date = new Date(article.published_at)
    if (!Number.isNaN(date.getTime())) published = date.toISOString()

    out = inject(
      html,
      buildTags({
        title,
        description,
        url: `${origin}/articulo/${slug}`,
        image,
        imageAlt,
        published,
      })
    )
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8")
  // Los programas de las redes y Vercel guardan la respuesta unos minutos: la web no se satura
  res.setHeader(
    "Cache-Control",
    article ? "public, s-maxage=300, stale-while-revalidate=3600" : "public, s-maxage=60"
  )
  res.status(200).send(out)
}