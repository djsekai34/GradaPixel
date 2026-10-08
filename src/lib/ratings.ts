import { supabase } from "@/lib/supabase"

export interface RatingResult {
  average: number
  votes: number
}

const VOTER_KEY = "gp-voter-id"
const voteKey = (slug: string) => `gp-vote:${slug}`

function getVoterId(): string {
  try {
    let id = localStorage.getItem(VOTER_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VOTER_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function getMyVote(slug: string): number | null {
  try {
    const v = Number(localStorage.getItem(voteKey(slug)))
    return Number.isInteger(v) && v >= 1 && v <= 5 ? v : null
  } catch {
    return null
  }
}

export function saveMyVote(slug: string, value: number) {
  try {
    localStorage.setItem(voteKey(slug), String(value))
  } catch {
    // Si no se puede guardar, el voto ya está en el servidor
  }
}

type Row = { avg_rating: number | string; vote_count: number | string }

function toResult(data: Row[] | null): RatingResult {
  const row = data?.[0]
  return {
    average: Number(row?.avg_rating ?? 0),
    votes: Number(row?.vote_count ?? 0),
  }
}

export async function getRating(slug: string): Promise<RatingResult> {
  if (!supabase) throw new Error("Valoraciones no configuradas")
  const { data, error } = await supabase.rpc("get_article_rating", { p_slug: slug })
  if (error) throw error
  return toResult(data)
}

export async function vote(slug: string, rating: number): Promise<RatingResult> {
  if (!supabase) throw new Error("Valoraciones no configuradas")
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Puntuación no válida")
  }
  const { data, error } = await supabase.rpc("vote_article", {
    p_slug: slug,
    p_voter: getVoterId(),
    p_rating: rating,
  })
  if (error) throw error
  return toResult(data)
}