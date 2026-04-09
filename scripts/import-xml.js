#!/usr/bin/env node
// ============================================================
// FS25 XML Import Pipeline — v2
//
// Usage:
//   node scripts/import-xml.js --map riverbend_springs --patch 1.4.0 --dir ./xml/mapUS
//   node scripts/import-xml.js --map hutan_pantai    --patch 1.4.0 --dir ./xml/mapAS
//   node scripts/import-xml.js --map zielonka        --patch 1.4.0 --dir ./xml/mapEU
//
// Flags:
//   --map      Map slug
//   --patch    Patch version string e.g. "1.4.0"
//   --dir      Path to the map folder (contains mapXX.xml and config/ subfolder)
//   --approve  Auto-approve all changes (dev only)
//   --dry-run  Parse and diff only, write nothing
//
// Env vars needed in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { parseArgs } from 'util'

// ── Load .env.local ───────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

// ── Args ──────────────────────────────────────────────────────
const { values: args } = parseArgs({
  args: process.argv.slice(2),
  options: {
    game:      { type: 'string' },
    map:       { type: 'string' },
    patch:     { type: 'string' },
    dir:       { type: 'string' },
    approve:   { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
})

const MAP_SLUG     = args.map
const PATCH        = args.patch
const XML_DIR      = args.dir ? resolve(args.dir) : null
const AUTO_APPROVE = args.approve
const DRY_RUN      = args['dry-run']

if (!MAP_SLUG || !PATCH || !XML_DIR) {
  console.error('Usage: node scripts/import-xml.js --map <slug> --patch <ver> --dir <path>')
  process.exit(1)
}

// ── Supabase ──────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── XML helpers ───────────────────────────────────────────────
function readXML(relPath) {
  const full = join(XML_DIR, relPath)
  if (!existsSync(full)) return null
  console.log(`  [read] ${relPath}`)
  return readFileSync(full, 'utf8')
}

function readAbsXML(absPath) {
  if (!existsSync(absPath)) return null
  return readFileSync(absPath, 'utf8')
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, 'i'))
  return m ? m[1] : null
}

function extractTags(xml, tagName) {
  const results = []
  // Normalize line endings first
  const normalized = xml.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  
  // Use a stack-based approach for nested tags
  const openRe  = new RegExp(`<${tagName}((?:\\s|[^>]|"[^"]*")*?)(/?)>`, 'gi')
  const closeRe = new RegExp(`</${tagName}>`, 'gi')
  
  let m
  while ((m = openRe.exec(normalized)) !== null) {
    const attrStr   = m[1] ?? ''
    const selfClose = m[2] === '/'
    
    if (selfClose) {
      results.push({ attrs: attrStr, inner: '' })
      continue
    }
    
    // Find matching close tag, accounting for nesting
    const start = openRe.lastIndex
    let depth = 1
    let pos   = start
    
    while (depth > 0 && pos < normalized.length) {
      const nextOpen  = normalized.indexOf(`<${tagName}`, pos)
      const nextClose = normalized.indexOf(`</${tagName}>`, pos)
      
      if (nextClose === -1) break
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++
        pos = nextOpen + tagName.length + 1
      } else {
        depth--
        if (depth === 0) {
          results.push({ attrs: attrStr, inner: normalized.slice(start, nextClose) })
          openRe.lastIndex = nextClose + tagName.length + 3
        } else {
          pos = nextClose + tagName.length + 3
        }
      }
    }
  }
  return results
}

// ── Parse farmlands.xml ───────────────────────────────────────
// Structure: <farmlands pricePerHa="60000"> <farmland id="1" priceScale="1" .../>
// We store id, priceScale, pricePerHa, npcName, and computed base price
function parseFarmlands(xml) {
  const wrapper = extractTags(xml, 'farmlands')[0]
  if (!wrapper) return []

  const pricePerHa = parseFloat(attr(wrapper.attrs, 'pricePerHa') ?? '60000')

  return extractTags(xml, 'farmland').map(({ attrs }) => {
    const id         = parseInt(attr(attrs, 'id') ?? '0')
    const priceScale = parseFloat(attr(attrs, 'priceScale') ?? '1')
    const npcName    = attr(attrs, 'npcName') ?? null
    const isDefault  = attr(attrs, 'defaultFarmProperty') === 'true'
    const showOnScreen = attr(attrs, 'showOnFarmlandsScreen') !== 'false'

    return {
      game_id:       id,
      price:         pricePerHa * priceScale,  // base price per ha × scale; real price = this × field size ha
      size_ha:       null,                     // not available in XML — requires i3d geometry
      coord_x:       null,
      coord_y:       null,
      patch_version: PATCH,
      // extra metadata stored for reference
      _price_scale:  priceScale,
      _price_per_ha: pricePerHa,
      _npc_name:     npcName,
      _is_default:   isDefault,
      _show_on_screen: showOnScreen,
    }
  }).filter(f => f.game_id > 0)
}

// ── Parse sell points from placeables.xml ─────────────────────
// Look for placeables with 'sellingStation' or 'grainElevator' or 'selling' in filename/uniqueId
// and extract position coordinates
function parseSellPoints(xml) {
  const sellPoints = []
  const allPlaceables = extractTags(xml, 'placeable')

  for (const { attrs } of allPlaceables) {
    const filename  = attr(attrs, 'filename') ?? ''
    const uniqueId  = attr(attrs, 'uniqueId') ?? ''
    const position  = attr(attrs, 'position') ?? ''

    // Identify sell points by filename pattern
    const isSellPoint = (
      filename.includes('sellingStation') ||
      filename.includes('sellingPoint') ||
      filename.includes('grainElevator') ||
      filename.includes('grainBarge') ||
      filename.includes('grainRiver') ||
      filename.includes('farmersMarket') ||
      filename.includes('Restaurant') ||
      uniqueId.includes('sellingStation') ||
      uniqueId.includes('farmersMarket') ||
      uniqueId.includes('bga')
    )

    if (!isSellPoint) continue

    // Parse position "x y z" → x is east-west, z is north-south in FS25
    const [px, py, pz] = position.split(' ').map(parseFloat)

    // Extract a human-readable name from filename or uniqueId
    const rawName = filename
      ? filename.split('/').pop()?.replace('.xml', '') ?? uniqueId
      : uniqueId.replace(/preplaced_/, '').replace(/_[a-f0-9]{32}$/, '')

    sellPoints.push({
      game_name:         rawName,
      accepted_products: [],   // filled in later from individual building XMLs
      coord_x:           isNaN(px) ? null : px,
      coord_y:           isNaN(pz) ? null : pz,  // FS25 uses Z as the ground-plane Y
      patch_version:     PATCH,
    })
  }

  return sellPoints
}

// ── Parse production buildings from placeables.xml ────────────
// Finds all production point placeables with a filename we can follow
function getProductionBuildingPaths(xml) {
  const buildings = []
  const allPlaceables = extractTags(xml, 'placeable')

  for (const { attrs } of allPlaceables) {
    const filename = attr(attrs, 'filename') ?? ''
    const uniqueId = attr(attrs, 'uniqueId') ?? ''

    // Production buildings have explicit filename references
    if (!filename || filename === '') continue
    if (filename.includes('sellingStation')) continue
    if (filename.includes('buyingStation')) continue
    if (filename.includes('trainSystem')) continue

    buildings.push({ filename, uniqueId })
  }

  // Also extract preplaced production points by uniqueId pattern
  // These reference their XML via the uniqueId naming convention
  const productionKeywords = [
    'bakery', 'dairy', 'sawmill', 'oilPlant', 'flourMill', 'grainFlour',
    'carpenter', 'cementFactory', 'cannedPackaged', 'cooper', 'paperMill',
    'ropeMaker', 'spinnery', 'tailor', 'dredging', 'bga',
    // mapAS (Hutan Pantai)
    'ricemill', 'aquaculture', 'fishery', 'coconut', 'rubber',
    // mapEU (Zielonka)
    'pianoFactory', 'sugarFactory', 'vegetable',
  ]

  for (const { attrs } of allPlaceables) {
    const uniqueId = (attr(attrs, 'uniqueId') ?? '').toLowerCase()
    if (!uniqueId) continue
    const isProduction = productionKeywords.some(k => uniqueId.includes(k.toLowerCase()))
    if (isProduction && !attr(attrs, 'filename')) {
      buildings.push({ filename: '', uniqueId: attr(attrs, 'uniqueId') ?? '' })
    }
  }

  return buildings
}

// ── Parse a single production building XML ────────────────────
// Returns array of production chain records
function parseProductionXML(xml, buildingName) {
  const chains = []
  const productions = extractTags(xml, 'production')

  for (const { attrs, inner } of productions) {
    const id            = attr(attrs, 'id') ?? buildingName
    const cyclesPerHour = parseFloat(attr(attrs, 'cyclesPerHour') ?? '0')
    const costsPerHour  = parseFloat(attr(attrs, 'costsPerActiveHour') ?? '0')

    const inputs  = extractTags(inner, 'input').map(i => {
      const fillType = attr(i.attrs, 'fillType') ?? ''
      const amount   = parseFloat(attr(i.attrs, 'amount') ?? '0')
      return `${fillType}:${amount}`
    }).filter(Boolean)

    const outputs = extractTags(inner, 'output').map(o => {
      const fillType = attr(o.attrs, 'fillType') ?? ''
      const amount   = parseFloat(attr(o.attrs, 'amount') ?? '0')
      return `${fillType}:${amount}`
    }).filter(Boolean)

    if (inputs.length === 0 && outputs.length === 0) continue

    chains.push({
      name:             `${buildingName} — ${id}`,
      inputs,
      outputs,
      base_rate_per_hr: cyclesPerHour || null,
      sell_point_ids:   [],
      patch_version:    PATCH,
      _costs_per_hour:  costsPerHour,
    })
  }

  return chains
}

// ── Resolve production building XMLs ─────────────────────────
// For preplaced buildings without a filename, try to find the XML
// by looking in the game data path
// Known production building paths per map slug
// These are the preplaced buildings that don't have explicit filename attributes
const KNOWN_PRODUCTION_BUILDINGS = {
  riverbend_springs: [
    'placeables/mapUS/bakeryUS/bakeryUS.xml',
    'placeables/mapUS/cannedPackagedFactoryUS/cannedPackagedFactoryUS.xml',
    'placeables/mapUS/carpenterUS/carpenterUS.xml',
    'placeables/mapUS/cementFactoryUS/cementFactoryUS.xml',
    'placeables/mapUS/cooperUS/cooperUS.xml',
    'placeables/mapUS/dairyUS/dairyUS.xml',
    'placeables/mapUS/grainFlourMillUS/grainFlourMillUS.xml',
    'placeables/mapUS/oilPlantUS/oilPlantUS.xml',
    'placeables/mapUS/paperMill/paperMill.xml',
    'placeables/mapUS/ropemakerUS/ropeMakerUS.xml',
    'placeables/mapUS/sawmillUS/sawmillUS.xml',
    'placeables/mapUS/spinnery/spinneryUS.xml',
    'placeables/mapUS/tailorUS/tailorUS.xml',
    'placeables/mapUS/dredgingBoat/dredgingBoat.xml',
    'placeables/planET/bga1mw/bga1mw.xml',
  ],
  hutan_pantai: [
    'placeables/mapAS/bakeryAS/bakeryAS.xml',
    'placeables/mapAS/cannedPackagedFactoryAS/cannedPackagedFactoryAS.xml',
    'placeables/mapAS/carpenterAS/carpenterAS.xml',
    'placeables/mapAS/dairyAS/dairyAS.xml',
    'placeables/mapAS/grainFlourMillAS/grainFlourMillAS.xml',
    'placeables/mapAS/grapeProcessingPlantAS/grapeProcessingPlantAS.xml',
    'placeables/mapAS/oilPlantAS/oilPlantAS.xml',
    'placeables/mapAS/sawmillAS/sawmillAS.xml',
    'placeables/mapAS/spinneryAS/spinneryAS.xml',
    'placeables/mapAS/sugarMillAS/sugarMillAS.xml',
  ],
  zielonka: [
    'placeables/mapEU/bakery/bakery.xml',
    'placeables/mapEU/carpenter/carpenter.xml',
    'placeables/mapEU/cementFactoryEU/cementFactoryEU.xml',
    'placeables/mapEU/dairy/dairy.xml',
    'placeables/mapEU/pianoFactory/pianoFactory.xml',
    'placeables/mapEU/potatoProcessingPlant/potatoProcessingPlant.xml',
    'placeables/mapEU/preservedFoodFactory/preservedFoodFactory.xml',
    'placeables/mapEU/sawmill/sawmill.xml',
    'placeables/mapEU/soupFactory/soupFactory.xml',
    'placeables/mapEU/spinnery/spinnery.xml',
  ],
}

function resolveProductionChains(placeablesXML, gameDataRoot) {
  const chains = []

  // 1. Follow any explicit filename references in placeables.xml
  const buildingPaths = getProductionBuildingPaths(placeablesXML)
  for (const { filename } of buildingPaths) {
    if (!filename) continue
    const relativePath = filename.replace('$data/', '')
    const absPath = join(gameDataRoot, relativePath)
    const xml = readAbsXML(absPath)
    if (!xml) continue
    const buildingName = filename.split('/').slice(-2, -1)[0] ?? filename
    chains.push(...parseProductionXML(xml, buildingName))
  }

  // 2. Try known building paths for this map
  const knownPaths = KNOWN_PRODUCTION_BUILDINGS[MAP_SLUG] ?? []
  for (const relPath of knownPaths) {
    const absPath = join(gameDataRoot, relPath)
    const xml = readAbsXML(absPath)
    if (!xml) {
      console.log(`  [skip] not found: ${relPath}`)
      continue
    }
    const buildingName = relPath.split('/').slice(-2, -1)[0]
    console.log(`  [read] ${buildingName}`)
    chains.push(...parseProductionXML(xml, buildingName))
  }

  // Deduplicate by name
  const seen = new Set()
  return chains.filter(c => {
    if (seen.has(c.name)) return false
    seen.add(c.name)
    return true
  })
}

// ── Diff logic ────────────────────────────────────────────────
function diffRecords(existing, incoming, keyField) {
  const existingMap = new Map(existing.map(r => [String(r[keyField]), r]))
  const toUpsert = []
  const changes  = []

  for (const record of incoming) {
    const key = String(record[keyField])
    const old = existingMap.get(key)

    if (!old) {
      toUpsert.push(record)
      changes.push({ type: 'INSERT', key })
      continue
    }

    const fieldsChanged = []
    for (const [field, newVal] of Object.entries(record)) {
      if (field.startsWith('_') || field === 'patch_version') continue
      const oldVal = old[field]
      if (String(oldVal ?? '') !== String(newVal ?? '')) {
        fieldsChanged.push({ field, old_value: String(oldVal ?? ''), new_value: String(newVal ?? '') })
      }
    }

    if (fieldsChanged.length > 0) {
      toUpsert.push(record)
      changes.push({ type: 'UPDATE', key, fields: fieldsChanged })
    }
  }

  return { toUpsert, changes }
}

// ── Log to patch_import_log ───────────────────────────────────
async function logChanges(table, changes) {
  if (changes.length === 0 || DRY_RUN) return
  const rows = changes.map(c => ({
    patch_version:  PATCH,
    table_affected: table,
    record_game_id: c.key,
    field_name:     c.type === 'INSERT' ? '__new_record__' : c.fields?.map(f => f.field).join(','),
    old_value:      c.type === 'UPDATE' ? JSON.stringify(c.fields?.map(f => f.old_value)) : null,
    new_value:      c.type === 'UPDATE' ? JSON.stringify(c.fields?.map(f => f.new_value)) : null,
    status:         AUTO_APPROVE ? 'approved' : 'pending',
  }))

  const { error } = await supabase.from('patch_import_log').insert(rows)
  if (error) console.error(`  [error] logging ${table}:`, error.message)
}

// ── Strip internal fields before upsert ──────────────────────
function cleanRecord(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([k]) => !k.startsWith('_'))
  )
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log(`\nFS25 XML Import Pipeline v2`)
  console.log(`  Map:    ${MAP_SLUG}`)
  console.log(`  Patch:  ${PATCH}`)
  console.log(`  Dir:    ${XML_DIR}`)
  console.log(`  Mode:   ${DRY_RUN ? 'DRY RUN' : AUTO_APPROVE ? 'AUTO-APPROVE' : 'REVIEW REQUIRED'}`)
  console.log()

  // Verify map exists in DB
  const { data: map, error: mapErr } = await supabase
    .from('maps').select('id, slug').eq('slug', MAP_SLUG).single()
  if (mapErr || !map) {
    console.error(`[error] Map "${MAP_SLUG}" not found. Run the schema SQL first.`)
    process.exit(1)
  }
  console.log(`[ok] Map: ${map.slug} (${map.id})\n`)

  // Detect game data root (for resolving production building XMLs)
  // Go up from xml/mapXX/ to find the game data root
  const gameDataRoot = args.game ? resolve(args.game) : resolve(XML_DIR, '../../..')
  console.log(`[info] Game data root: ${gameDataRoot}`)

  // ── 1. Farmlands ─────────────────────────────────────────────
  const farmlandsXML = readXML('farmlands.xml')
  if (farmlandsXML) {
    console.log('\n[parse] farmlands.xml')
    const incoming = parseFarmlands(farmlandsXML).map(f => ({ ...cleanRecord(f), map_id: map.id }))
    console.log(`  ${incoming.length} farmlands parsed`)
    console.log(`  pricePerHa base: ${parseFarmlands(farmlandsXML)[0]?._price_per_ha ?? 'unknown'}`)

    const { data: existing } = await supabase.from('farmlands').select('*').eq('map_id', map.id)
    const { toUpsert, changes } = diffRecords(existing ?? [], incoming, 'game_id')
    console.log(`  ${changes.filter(c => c.type === 'INSERT').length} new · ${changes.filter(c => c.type === 'UPDATE').length} changed`)

    await logChanges('farmlands', changes)
    if (!DRY_RUN && toUpsert.length > 0) {
      if (AUTO_APPROVE) {
        const { error } = await supabase.from('farmlands').upsert(toUpsert, { onConflict: 'map_id,game_id' })
        if (error) console.error('  [error]', error.message)
        else console.log(`  [ok] upserted ${toUpsert.length} farmlands`)
      } else {
        console.log(`  [pending] ${toUpsert.length} changes logged for admin review`)
      }
    }
  }

  // ── 2. Sell points from placeables.xml ───────────────────────
  const placeablesXML = readXML('placeables.xml')
  if (placeablesXML) {
    console.log('\n[parse] placeables.xml → sell points')
    const rawSellPoints = parseSellPoints(placeablesXML).map(s => ({ ...s, map_id: map.id }))
    // Deduplicate by game_name within this batch
    const seenNames = new Map()
    rawSellPoints.forEach(s => seenNames.set(s.game_name, s))
    const incoming = [...seenNames.values()]
    console.log(`  ${incoming.length} sell points parsed (${rawSellPoints.length - incoming.length} duplicates removed)`)

    const { data: existing } = await supabase.from('sell_points').select('*').eq('map_id', map.id)
    const { toUpsert, changes } = diffRecords(existing ?? [], incoming, 'game_name')
    console.log(`  ${changes.filter(c => c.type === 'INSERT').length} new · ${changes.filter(c => c.type === 'UPDATE').length} changed`)

    await logChanges('sell_points', changes)
    if (!DRY_RUN && toUpsert.length > 0) {
      if (AUTO_APPROVE) {
        const { error } = await supabase.from('sell_points').upsert(toUpsert, { onConflict: 'map_id,game_name' })
        if (error) console.error('  [error]', error.message)
        else console.log(`  [ok] upserted ${toUpsert.length} sell points`)
      } else {
        console.log(`  [pending] ${toUpsert.length} changes logged for admin review`)
      }
    }
  }

  // ── 3. Production chains ──────────────────────────────────────
  if (placeablesXML) {
    console.log('\n[parse] production building XMLs')
    const chains = resolveProductionChains(placeablesXML, gameDataRoot)
    console.log(`  ${chains.length} production chains parsed`)

    if (chains.length > 0) {
      const incoming = chains.map(c => ({ ...cleanRecord(c), map_id: map.id }))
      const { data: existing } = await supabase.from('production_chains').select('*').eq('map_id', map.id)
      const { toUpsert, changes } = diffRecords(existing ?? [], incoming, 'name')
      console.log(`  ${changes.filter(c => c.type === 'INSERT').length} new · ${changes.filter(c => c.type === 'UPDATE').length} changed`)

      await logChanges('production_chains', changes)
      if (!DRY_RUN && toUpsert.length > 0) {
        if (AUTO_APPROVE) {
          const { error } = await supabase.from('production_chains').upsert(toUpsert, { onConflict: 'map_id,name' })
          if (error) console.error('  [error]', error.message)
          else console.log(`  [ok] upserted ${toUpsert.length} production chains`)
        } else {
          console.log(`  [pending] ${toUpsert.length} changes logged for admin review`)
        }
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50))
  if (DRY_RUN) {
    console.log('DRY RUN complete — nothing written')
  } else if (!AUTO_APPROVE) {
    console.log('Import complete. Changes pending admin review at /admin/patch-review')
  } else {
    console.log('Import complete. All changes written.')
  }
  console.log()
}

main().catch(err => { console.error('[fatal]', err); process.exit(1) })
