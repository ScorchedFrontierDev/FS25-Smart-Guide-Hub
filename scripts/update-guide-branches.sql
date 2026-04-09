-- Updates the Riverbend $0 Start guide with proper branching content
-- Step 3 (index 2) is the decision — tractor path goes to step index 3a, land path to 3b
-- Both paths rejoin at the Phase 1 milestone (index 7)

update guides
set
  total_steps = 15,
  content_blocks = '[
    {
      "step": 0,
      "type": "step",
      "title": "Start with contracts only",
      "body": "You have no money and no land. Head to the contracts board immediately — look for baling or fertilizing contracts first. These pay well and require no owned equipment since you can lease what you need.",
      "tip": "Sort contracts by profit. Avoid harvesting contracts early — they require precise timing and better equipment.",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 1,
      "type": "step",
      "title": "Complete 3 contracts before buying anything",
      "body": "Resist the urge to buy equipment immediately. Do at least 3 contracts using leased machinery. Each completed contract builds your cash reserve. Target $8,000–$12,000 before your first purchase.",
      "tip": "Baling contracts on Riverbend pay well. Check the used equipment market — prices vary by patch version and will be pulled from real game data once XML files are imported.",
      "phase": "Phase 1 — Survival"
    },
    {
      "step": 2,
      "type": "decision",
      "title": "First purchase decision",
      "body": "You have around $10,000. This is your first major fork — what you buy now shapes the next hour of gameplay. Check the used equipment tab first before committing to a new tractor — availability varies.",
      "phase": "Phase 1 — Survival",
      "options": [
        {
          "label": "Buy a used tractor",
          "consequence": "More contract flexibility, slower path to owned land. Best if a cheap used tractor is available.",
          "next_step": 3
        },
        {
          "label": "Buy land first",
          "consequence": "Immediate crop income potential, but you will still need to lease equipment for every operation.",
          "next_step": 6
        }
      ]
    },
    {
      "step": 3,
      "type": "step",
      "title": "Use your tractor to run higher-value contracts",
      "body": "With a tractor owned, you eliminate the leasing surcharge on every contract. Target cultivation and fertilizing jobs — they pay $1,500–$2,500 and your owned tractor handles them without extra cost eating into your margin.",
      "tip": "Avoid taking contracts too far from the main road. Travel time is unpaid and kills your effective hourly rate.",
      "phase": "Phase 1 — Tractor path"
    },
    {
      "step": 4,
      "type": "step",
      "title": "Save up and buy your first field",
      "body": "Run contracts until you have enough to buy a small field outright — targeting fields priced in the lower range for Riverbend. Adjacent fields reduce travel time significantly. Check the Land Analyzer tool once it is available for price-per-hectare comparisons.",
      "phase": "Phase 1 — Tractor path"
    },
    {
      "step": 5,
      "type": "step",
      "title": "Lease a seeder and plant your first crop",
      "body": "With land owned and your tractor in hand, lease a cultivator and seeder combo. Plant wheat — shortest grow cycle, sells at the Grain Elevator directly west of town. This is the moment both paths converge.",
      "tip": "Wheat is your best first crop on Riverbend. Fast cycle, reliable buyer nearby, and low equipment requirements.",
      "phase": "Phase 1 — Tractor path"
    },
    {
      "step": 6,
      "type": "step",
      "title": "Lease equipment and plant your first field immediately",
      "body": "You own land but no equipment. Lease a cultivator and seeder — the cost per use is higher than owning, but you only need it for one planting cycle. Get wheat in the ground straight away. The crop income will outpace lease costs.",
      "tip": "On the land-first path, your priority after harvesting is buying a tractor so you stop paying lease fees on every job.",
      "phase": "Phase 1 — Land path"
    },
    {
      "step": 7,
      "type": "milestone",
      "title": "Phase 1 complete — paths converge here",
      "body": "Both paths meet at this point. You should have at least one field with a crop planted and some cash in reserve. The exact amounts depend on your path and contract work, but the direction is the same from here.",
      "check": "At least one field owned · One crop in the ground · Cash reserve above $2,000",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 8,
      "type": "step",
      "title": "Harvest and sell your first crop",
      "body": "Lease a combine harvester when your wheat is ready. Harvest the field and haul directly to the Grain Elevator Museum on the river — it pays a premium over the standard elevator. Watch for the price ticker and sell when it peaks.",
      "tip": "The ferry crossing unlocks faster routes to the south sell points. Use it once you can afford the crossing fee.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 9,
      "type": "step",
      "title": "Fill the equipment gap from your path",
      "body": "Land-first players: buy a tractor now — you have harvest income and can stop leasing for every job. Tractor-first players: buy a seeder and cultivator — two planting seasons of leasing costs more than ownership. Close whichever gap you have.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 10,
      "type": "step",
      "title": "Expand to a second field",
      "body": "With core equipment owned and cash in reserve, buy a second field adjacent to your first. Adjacent fields cut travel time between operations significantly. Target fields nearby on Riverbend — flat, accessible, and often priced competitively.",
      "tip": "Use the Land Analyzer tool to compare price per hectare before buying. Smaller adjacent fields often beat larger distant ones in effective value.",
      "phase": "Phase 2 — Stability"
    },
    {
      "step": 11,
      "type": "milestone",
      "title": "Phase 2 complete",
      "body": "You should now have two owned fields, a core equipment set, and a positive cash flow from contracts and crop sales.",
      "check": "2 fields owned · Tractor + seeder + cultivator owned · Positive cash flow",
      "phase": "Phase 3 — Growth"
    },
    {
      "step": 12,
      "type": "step",
      "title": "Add canola to your rotation",
      "body": "Wheat-only farming leaves money on the table. Plant canola on your second field. It sells at the Oil Mill north of the river for a significant premium and fits naturally into a wheat rotation.",
      "tip": "If you have Precision Farming enabled, check soil nitrogen before switching crops. Canola is nitrogen-hungry and will degrade unprepared soil.",
      "phase": "Phase 3 — Growth"
    },
    {
      "step": 13,
      "type": "step",
      "title": "Save for a combine of your own",
      "body": "Leasing a combine every harvest cycle is your biggest remaining cost. With two crops rotating across two fields, a combine pays for itself within two to three harvest cycles. Start saving now — target a used model in the mid-range.",
      "phase": "Phase 3 — Growth"
    },
    {
      "step": 14,
      "type": "milestone",
      "title": "You made it — endgame begins",
      "body": "You started with nothing and built a self-sustaining farm from contracts alone. From here the path is yours — expand land, add a production chain, or push toward the 100-field mark.",
      "check": "3+ fields owned · Full equipment set including combine · $20,000+ in reserve",
      "phase": "Phase 3 — Growth"
    }
  ]'::jsonb
where title = 'Riverbend Springs — $0 Start Guide';
