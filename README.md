# FS25 Smart Guide Hub

A dynamic, personalized Farming Simulator 25 platform where guides, tools, and challenges adapt to your exact map and DLC setup.

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

Get your values from: **Supabase Dashboard → Settings → API**
- `NEXT_PUBLIC_SUPABASE_URL` — your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (for the XML import script only)

### 3. Run the database schema
Open the **SQL Editor** in your Supabase dashboard, paste the contents of `fs25_schema.sql`, and click Run.

### 4. Enable Auth providers (optional)
In Supabase Dashboard → Authentication → Providers:
- Enable **Google** (requires OAuth credentials from Google Cloud Console)
- Enable **Discord** (requires OAuth app from Discord Developer Portal)
- Magic link (email) works out of the box

### 5. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage — map selector
│   ├── dashboard/          # User dashboard
│   ├── auth/               # Login + OAuth callback
│   ├── maps/[slug]/        # Map detail pages
│   ├── guides/             # Guide browser + reader
│   ├── tools/              # ROI, Land Analyzer, Production Planner
│   ├── challenges/         # Community challenges
│   ├── coop/               # Co-op hub
│   └── admin/              # Admin moderation dashboard
│
├── components/             # Reusable UI components
│   ├── ui/                 # Base components (Button, Card, etc.)
│   ├── dlc/                # DLC selector, toggle, profile
│   ├── maps/               # Map selector, overlay
│   ├── guides/             # Step tracker, branch renderer
│   ├── challenges/         # Challenge card, submission form
│   └── tools/              # ROI calc, land table, planner
│
├── hooks/
│   ├── useAuth.ts          # Auth state
│   └── useDLCContext.ts    # DLC ownership state + toggle
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   ├── server.ts       # Server Supabase client
│   │   └── middleware.ts   # Session refresh middleware
│   ├── dlc.ts              # DLC conditional logic layer
│   └── queries.ts          # All data-fetching functions
│
├── types/
│   └── database.ts         # TypeScript types from schema
│
└── middleware.ts            # Session refresh on every request
```

---

## Build order

### Phase 1 (current) — Foundation ✓
- [x] Database schema (`fs25_schema.sql`)
- [x] Next.js project scaffold
- [x] Supabase client (browser + server)
- [x] DLC conditional logic layer
- [x] Auth (magic link, Google, Discord)
- [x] Basic map/dashboard pages
- [ ] XML import pipeline script
- [ ] DLC selection UI

### Phase 2 — Core features
- [ ] Interactive guide reader with step tracking
- [ ] User save system UI
- [ ] Challenge configuration + Best Start Generator
- [ ] DLC profile page

### Phase 3 — Tools
- [ ] Land Analyzer (needs XML data)
- [ ] ROI Calculator
- [ ] Production Planner

### Phase 4 — Community
- [ ] Challenge submission form
- [ ] Moderation dashboard
- [ ] Browse + filter challenges

---

## XML import pipeline
Once you have the game XML files, run:
```bash
node scripts/import-xml.js --map riverbend_springs --patch 1.4.0
```
(Script to be built in Phase 1 completion)

---

## Deployment (Vercel)
1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel project settings
4. Deploy — Vercel auto-deploys on every push to main
