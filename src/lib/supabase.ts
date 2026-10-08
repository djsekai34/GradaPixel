import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Si faltan las claves, la web sigue funcionando; solo se oculta la votación
export const supabase = url && key ? createClient(url, key) : null
export const ratingsEnabled = supabase !== null