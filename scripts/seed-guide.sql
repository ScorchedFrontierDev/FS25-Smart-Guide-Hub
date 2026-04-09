-- ============================================================
-- Sample Guide Seed: Riverbend Springs — $0 Start (Survival)
-- Run this in Supabase SQL Editor after the main schema
-- ============================================================

insert into guides (
  map_id,
  required_dlc_id,
  guide_type,
  playstyle,
  difficulty,
  title,
  total_steps,
  is_published,
  content_blocks
)
select
  m.id,
  null,
  'survival',
  'farming',
  'survival',
  'Riverbend Springs — $0 Start Guide',
  12,
  true,
  '[
    {
      "step": 1,
      "type": "step",
      "title": "Start with contracts only",
      "body": "You have no money and no land. Head to the contracts board immediately — look for baling or fertilizing contracts first. These pay well and require no owned equipment since you can lease what you need.",
      "tip": "Sort contracts by profit. Avoid harvesting contracts early — they require precise timing and better equipment.",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 2,
      "type": "step",
      "title": "Complete 3 contracts before buying anything",
      "body": "Resist the urge to buy equipment immediately. Do at least 3 contracts using leased machinery. Each completed contract builds your cash reserve. Target $8,000–$12,000 before your first purchase.",
      "tip": "Baling contracts on Riverbend pay $1,800–$2,400 each. Three of those gets you to a solid starting position.",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 3,
      "type": "decision",
      "title": "First purchase decision",
      "body": "You have around $10,000. This is your first major fork — what you buy now shapes the next 2 hours of gameplay.",
      "options": [
        { "label": "Buy a used tractor ($4,500)", "consequence": "More flexibility for contracts, slower path to owned land" },
        { "label": "Buy Field 3 outright ($6,200)", "consequence": "Immediate crop income, still need to lease equipment" }
      ],
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 4,
      "type": "step",
      "title": "Lease a cultivator and sow your first field",
      "body": "Whether you bought land or not, get a crop in the ground. Lease a cultivator and seeder combo. Plant wheat — it has the shortest grow cycle and sells at the Grain Elevator directly west of town.",
      "tip": "Wheat takes 3 in-game days to mature on standard growth speed. Plan contracts around this window.",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 5,
      "type": "milestone",
      "title": "Phase 1 complete",
      "body": "You should now have: at least one field planted, $3,000–$5,000 in reserve, and 2–3 completed contracts under your belt. If you are below $2,000 at this point, do one more contract before moving on.",
      "check": "Cash reserve above $2,000 · At least one crop in the ground",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 6,
      "type": "step",
      "title": "Harvest and sell your first crop",
      "body": "Lease a combine harvester when your wheat is ready. Harvest the field and haul directly to the Grain Elevator Museum on the river — it pays a premium over the standard elevator. Watch for the price ticker and sell when it peaks.",
      "tip": "The ferry crossing unlocks faster routes to the south sell points. Use it once you can afford the crossing fee.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 7,
      "type": "step",
      "title": "Buy your first owned piece of equipment",
      "body": "After your first harvest you should have $18,000–$25,000. Now buy one piece of equipment outright — a used tractor in the $8,000–$12,000 range. This eliminates leasing costs for every future contract and owned field operation.",
      "tip": "Check the used equipment market before buying new. You can find 80hp tractors for under $9,000 that handle everything in Phase 2.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 8,
      "type": "step",
      "title": "Expand to a second field",
      "body": "With a tractor owned and cash in reserve, buy a second field adjacent to your first. Adjacent fields reduce travel time between operations significantly. Target fields 4 or 5 on Riverbend — they are flat, accessible, and priced under $9,000.",
      "tip": "Use the Land Analyzer tool to compare price per hectare before buying.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 9,
      "type": "milestone",
      "title": "Phase 2 complete",
      "body": "You should now have: 2 owned fields, 1 owned tractor, $5,000+ in reserve, and a reliable contract income stream covering your operating costs.",
      "check": "2 fields owned · 1 tractor owned · Positive cash flow",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 10,
      "type": "step",
      "title": "Diversify — add canola to your rotation",
      "body": "Wheat-only farming leaves money on the table. Add canola to your second field. Canola sells at the Oil Mill north of the river for a significant premium over grain prices, and it fits naturally into a wheat rotation without exhausting soil nutrients.",
      "tip": "If you have Precision Farming enabled, check soil nitrogen levels before switching crops. Canola is nitrogen-hungry.",
      "phase": "Phase 3 — Growth"
    },
    {
      "step": 11,
      "type": "step",
      "title": "Buy a seeder and cultivator outright",
      "body": "Leasing these for every planting cycle is costing you $800–$1,200 per season. At this stage you have enough fields to justify ownership. A used cultivator and seeder together should run $6,000–$9,000 and pay for themselves within two seasons.",
      "phase": "Phase 3 — Growth"
    },
    {
      "step": 12,
      "type": "milestone",
      "title": "You made it — endgame begins",
      "body": "You started with nothing and built a self-sustaining farm from contracts alone. From here the path is yours — expand land holdings, add a production chain, or start saving for a combine of your own. The hard part is over.",
      "check": "3+ fields owned · Full equipment set owned · $20,000+ in reserve",
      "phase": "Phase 3 — Growth"
    }
  ]'::jsonb
from maps m
where m.slug = 'riverbend_springs';
