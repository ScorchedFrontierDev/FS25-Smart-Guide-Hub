// ============================================================
// Data Fetching — all Supabase queries in one place
// Every query that touches user-specific data accepts a DLCContext
// and filters content accordingly.
// ============================================================

import { createClient } from '@/lib/supabase/server'
import { buildDLCContext, canAccessContent, canAccessMap, type DLCContext } from '@/lib/dlc'

// ── Maps ──────────────────────────────────────────────────────

/** Fetch all maps, annotated with whether the current user can access each one */
export async function getMapsWithAccess(ctx: DLCContext) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('maps').select('*')
  if (error) throw error
  return data.map(map => ({
    ...map,
    accessible: canAccessMap(map.slug, ctx),
  }))
}

// ── DLCs ─────────────────────────────────────────────────────

/** Fetch all DLCs */
export async function getAllDLCs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('dlcs')
    .select('*')
    .order('tier')
    .order('price')
  if (error) throw error
  return data
}

/** Fetch a user's owned DLC slugs from their profile */
export async function getUserOwnedDLCSlugs(userId: string): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_dlc_profile')
    .select('dlc_id, is_owned, dlcs(slug)')
    .eq('user_id', userId)
    .eq('is_owned', true)
  if (error) throw error
  return data
    .map(row => (row.dlcs as { slug: string } | null)?.slug)
    .filter(Boolean) as string[]
}

/** Build a DLCContext for the currently logged-in user */
export async function getDLCContextForUser(userId: string): Promise<DLCContext> {
  const ownedSlugs = await getUserOwnedDLCSlugs(userId)
  return buildDLCContext(ownedSlugs)
}

// ── Guides ────────────────────────────────────────────────────

/** Fetch guides visible to a user given their DLC context */
export async function getGuidesForUser(
  ctx: DLCContext,
  options: { mapSlug?: string; guideType?: string } = {}
) {
  const supabase = await createClient()

  let query = supabase
    .from('guides')
    .select('*, maps(slug, name), dlcs(slug)')
    .eq('is_published', true)

  if (options.mapSlug) {
    const { data: map } = await supabase
      .from('maps')
      .select('id')
      .eq('slug', options.mapSlug)
      .single()
    if (map) query = query.or(`map_id.eq.${map.id},map_id.is.null`)
  }

  if (options.guideType) {
    query = query.eq('guide_type', options.guideType)
  }

  const { data, error } = await query
  if (error) throw error

  // Filter out guides that require a DLC the user doesn't own
  return data.filter(guide => {
    const requiredSlug = (guide.dlcs as { slug: string } | null)?.slug ?? null
    return canAccessContent(requiredSlug, ctx)
  })
}

// ── Challenges ────────────────────────────────────────────────

/** Fetch approved community challenges, filtered by user's DLC ownership */
export async function getChallengesForUser(
  ctx: DLCContext,
  options: { mapSlug?: string; category?: string } = {}
) {
  const supabase = await createClient()

  let query = supabase
    .from('challenges')
    .select(`
      *,
      maps(slug, name),
      challenge_dlc_requirements(dlc_id, dlcs(slug))
    `)
    .eq('status', 'approved')

  if (options.mapSlug) {
    const { data: map } = await supabase
      .from('maps')
      .select('id')
      .eq('slug', options.mapSlug)
      .single()
    if (map) query = query.eq('map_id', map.id)
  }

  if (options.category) {
    query = query.eq('category', options.category)
  }

  const { data, error } = await query
  if (error) throw error

  // Filter challenges whose required DLCs the user doesn't own
  return data.filter(challenge => {
    const requirements = challenge.challenge_dlc_requirements as
      Array<{ dlcs: { slug: string } | null }> | null
    if (!requirements?.length) return true
    return requirements.every(req => {
      const slug = req.dlcs?.slug ?? null
      return canAccessContent(slug, ctx)
    })
  })
}

// ── User Saves ────────────────────────────────────────────────

/** Fetch all saves for a user */
export async function getUserSaves(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_saves')
    .select('*, maps(name, slug)')
    .eq('user_id', userId)
    .order('last_played', { ascending: false })
  if (error) throw error
  return data
}

// ── Farmlands (Land Analyzer) ─────────────────────────────────

/** Fetch all farmlands for a map */
export async function getFarmlandsForMap(mapSlug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('farmlands')
    .select('*, maps!inner(slug)')
    .eq('maps.slug', mapSlug)
    .order('price')
  if (error) throw error
  return data
}

// ── Production Chains (Production Planner) ────────────────────

/** Fetch production chains accessible to a user */
export async function getProductionChainsForUser(
  ctx: DLCContext,
  mapSlug?: string
) {
  const supabase = await createClient()

  let query = supabase
    .from('production_chains')
    .select('*, dlcs(slug)')

  if (mapSlug) {
    const { data: map } = await supabase
      .from('maps')
      .select('id')
      .eq('slug', mapSlug)
      .single()
    if (map) query = query.or(`map_id.eq.${map.id},map_id.is.null`)
  }

  const { data, error } = await query
  if (error) throw error

  return data.filter(chain => {
    const requiredSlug = (chain.dlcs as { slug: string } | null)?.slug ?? null
    return canAccessContent(requiredSlug, ctx)
  })
}
