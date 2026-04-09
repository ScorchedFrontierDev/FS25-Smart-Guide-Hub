// ============================================================
// DLC Conditional Logic Layer
// This is the core engine that drives all content filtering.
// Every guide, tool, and challenge query runs through here.
// ============================================================

import type { DLC } from '@/types/database'

// DLC slugs as constants — use these everywhere instead of raw strings
export const DLC_SLUGS = {
  HIGHLANDS_FISHING:  'highlands_fishing',
  PRECISION_FARMING:  'precision_farming',
  STRAW_HARVEST:      'straw_harvest',
  PLAINS_PRAIRIES:    'plains_prairies',
  NEXAT:              'nexat',
  MACDON:             'macdon',
  VREDO:              'vredo',
  MERCEDES_TRUCKS:    'mercedes_trucks',
  JCB_WFT:            'jcb_wft',
  NH_CR11_GOLD:       'nh_cr11_gold',
  YEAR1_SEASON_PASS:  'year1_season_pass',
  YEAR2_SEASON_PASS:  'year2_season_pass',
} as const

// Map slugs — Kinlaig is gated behind Highlands Fishing
export const MAP_SLUGS = {
  RIVERBEND:   'riverbend_springs',
  HUTAN_PANTAI: 'hutan_pantai',
  ZIELONKA:    'zielonka',
  KINLAIG:     'kinlaig',
} as const

// Maps that require a specific DLC to access
export const MAP_DLC_REQUIREMENTS: Record<string, string> = {
  [MAP_SLUGS.KINLAIG]: DLC_SLUGS.HIGHLANDS_FISHING,
}

// Machine packs that unlock brand challenge filters
export const MACHINE_PACK_BRANDS: Record<string, string> = {
  [DLC_SLUGS.PLAINS_PRAIRIES]:   'Ford / Classic era',
  [DLC_SLUGS.NEXAT]:             'NEXAT',
  [DLC_SLUGS.MACDON]:            'MacDon',
  [DLC_SLUGS.VREDO]:             'Vredo',
  [DLC_SLUGS.MERCEDES_TRUCKS]:   'Mercedes-Benz',
  [DLC_SLUGS.JCB_WFT]:          'JCB',
}

// Season pass contents
export const SEASON_PASS_CONTENTS: Record<string, string[]> = {
  [DLC_SLUGS.YEAR1_SEASON_PASS]: [
    DLC_SLUGS.HIGHLANDS_FISHING,
    DLC_SLUGS.NEXAT,
    DLC_SLUGS.PLAINS_PRAIRIES,
    DLC_SLUGS.MACDON,
  ],
}

// ============================================================
// DLC Context — the runtime state of what a user owns
// ============================================================

export interface DLCContext {
  ownedSlugs: Set<string>
}

/**
 * Build a DLCContext from the list of DLC slugs a user owns.
 * Free DLCs (precision_farming, straw_harvest) are always included.
 * Season passes automatically expand to their contents.
 */
export function buildDLCContext(ownedSlugs: string[]): DLCContext {
  const slugs = new Set<string>([
    // Free defaults always on
    DLC_SLUGS.PRECISION_FARMING,
    DLC_SLUGS.STRAW_HARVEST,
    ...ownedSlugs,
  ])

  // Expand season passes
  for (const [passSLug, contents] of Object.entries(SEASON_PASS_CONTENTS)) {
    if (slugs.has(passSLug)) {
      contents.forEach(s => slugs.add(s))
    }
  }

  return { ownedSlugs: slugs }
}

// ============================================================
// Query helpers — use these in every data-fetching function
// ============================================================

/** Can the user access this map? */
export function canAccessMap(mapSlug: string, ctx: DLCContext): boolean {
  const requiredDLC = MAP_DLC_REQUIREMENTS[mapSlug]
  if (!requiredDLC) return true
  return ctx.ownedSlugs.has(requiredDLC)
}

/** Which maps can this user access? */
export function getAccessibleMaps(ctx: DLCContext): string[] {
  return Object.values(MAP_SLUGS).filter(slug => canAccessMap(slug, ctx))
}

/** Does the user have the Highlands Fishing expansion? */
export function hasHighlandsFishing(ctx: DLCContext): boolean {
  return ctx.ownedSlugs.has(DLC_SLUGS.HIGHLANDS_FISHING)
}

/** Does the user have Precision Farming? */
export function hasPrecisionFarming(ctx: DLCContext): boolean {
  return ctx.ownedSlugs.has(DLC_SLUGS.PRECISION_FARMING)
}

/** Which equipment brands are unlocked for Brand / Decades challenges? */
export function getUnlockedBrands(ctx: DLCContext): string[] {
  return Object.entries(MACHINE_PACK_BRANDS)
    .filter(([dlcSlug]) => ctx.ownedSlugs.has(dlcSlug))
    .map(([, brand]) => brand)
}

/** Can the user use a guide/tool that requires a specific DLC? */
export function canAccessContent(requiredDlcSlug: string | null, ctx: DLCContext): boolean {
  if (!requiredDlcSlug) return true
  return ctx.ownedSlugs.has(requiredDlcSlug)
}
