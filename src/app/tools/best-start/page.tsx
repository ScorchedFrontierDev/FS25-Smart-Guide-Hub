'use client'

import { useState } from 'react'

const MAPS = [
  { slug: 'riverbend_springs', name: 'Riverbend Springs' },
  { slug: 'hutan_pantai',      name: 'Hutan Pantai' },
  { slug: 'zielonka',          name: 'Zielonka' },
  { slug: 'kinlaig',           name: 'Kinlaig (requires Highlands Fishing DLC)' },
]

const PLAYSTYLES  = ['Farming', 'Mixed', 'Forestry focus', 'Contracts only']
const DIFFICULTIES = ['Easy', 'Standard', 'Hard', 'Survival ($0 start)']
const RISK_LEVELS  = ['Low — steady income first', 'Medium — balanced approach', 'High — go big early']

interface Strategy {
  firstPurchase: string
  firstIncome: string
  firstCrop: string
  phase1Goal: string
  phase2Goal: string
  tip: string
}

function generateStrategy(map: string, playstyle: string, difficulty: string, budget: number, risk: string): Strategy {
  const isSurvival  = difficulty === 'Survival ($0 start)'
  const isHighRisk  = risk.startsWith('High')
  const isLowRisk   = risk.startsWith('Low')
  const isFarming   = playstyle === 'Farming'
  const isContracts = playstyle === 'Contracts only'

  if (isSurvival || isContracts) {
    return {
      firstPurchase: 'Nothing — start with contracts only',
      firstIncome:   'Baling and fertilizing contracts (lease all equipment)',
      firstCrop:     'None until $8,000+ saved from contracts',
      phase1Goal:    'Accumulate $10,000–$15,000 through contracts alone',
      phase2Goal:    'Buy first field outright, lease equipment for planting',
      tip:           'Avoid harvesting contracts early — timing pressure and leased combines eat your margin.',
    }
  }

  if (budget < 5000) {
    return {
      firstPurchase: 'Used tractor if available under $4,000',
      firstIncome:   'Contracts with owned tractor to eliminate lease costs',
      firstCrop:     'Wheat on smallest available field',
      phase1Goal:    'Own a tractor and have one field planted',
      phase2Goal:    'Save enough from contracts to buy a seeder outright',
      tip:           'Check the used equipment tab before buying new — prices vary by patch.',
    }
  }

  const mapStrategies: Record<string, Partial<Strategy>> = {
    riverbend_springs: {
      firstCrop:   'Wheat — sells at the Grain Elevator west of town',
      tip:         'Use the ferry crossing to reach south sell points faster once you can afford the fee.',
    },
    hutan_pantai: {
      firstCrop:   'Rice — unique to this map, high value at the Rice Mill',
      tip:         'Waterwheel hotspots near rivers give crop bonuses — plant adjacent fields first.',
    },
    zielonka: {
      firstCrop:   'Potatoes or sugar beet — feeds the dense production chain network',
      tip:         'The Piano Factory is Zielonka\'s unique chain. Work toward it as a mid-game goal.',
    },
    kinlaig: {
      firstCrop:   'Fishing contracts early, then transition to salmon farming',
      tip:         'The harbor economy means sell points are concentrated near the coast — plan routes accordingly.',
    },
  }

  const mapExtra = mapStrategies[map] ?? {}

  return {
    firstPurchase: isHighRisk
      ? `Medium tractor ($${Math.round(budget * 0.5).toLocaleString()}) + seeder combo`
      : `Used tractor ($${Math.round(budget * 0.35).toLocaleString()}) — keep cash reserve`,
    firstIncome:   isLowRisk ? 'Contracts to supplement crop income' : 'First crop harvest',
    firstCrop:     mapExtra.firstCrop ?? 'Wheat — reliable buyer, short cycle',
    phase1Goal:    `Own ${isHighRisk ? '2–3 fields' : '1 field'} with full equipment set`,
    phase2Goal:    'Add second crop type to rotation and start saving for production building',
    tip:           mapExtra.tip ?? 'Always keep 20% of your capital as cash reserve.',
  }
}

export default function BestStartPage() {
  const [map, setMap]             = useState('riverbend_springs')
  const [playstyle, setPlaystyle] = useState('Farming')
  const [difficulty, setDifficulty] = useState('Standard')
  const [budget, setBudget]       = useState(50000)
  const [risk, setRisk]           = useState('Medium — balanced approach')
  const [generated, setGenerated] = useState(false)

  const strategy = generateStrategy(map, playstyle, difficulty, budget, risk)

  return (
    <main style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/tools" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Tools</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>Best Start Generator</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Get a personalized starting strategy based on your setup.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>

        {/* Map */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Map</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {MAPS.map(m => (
              <button key={m.slug} onClick={() => setMap(m.slug)} style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border)', cursor: 'pointer', background: map === m.slug ? 'var(--field)' : 'var(--surface-2)', color: map === m.slug ? 'white' : 'var(--text-secondary)' }}>
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Playstyle */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Playstyle</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {PLAYSTYLES.map(p => (
              <button key={p} onClick={() => setPlaystyle(p)} style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border)', cursor: 'pointer', background: playstyle === p ? 'var(--field)' : 'var(--surface-2)', color: playstyle === p ? 'white' : 'var(--text-secondary)' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Difficulty</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficulty(d)} style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border)', cursor: 'pointer', background: difficulty === d ? 'var(--field)' : 'var(--surface-2)', color: difficulty === d ? 'white' : 'var(--text-secondary)' }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Starting budget: ${budget.toLocaleString()}
          </label>
          <input type="range" min="0" max="500000" step="5000" value={budget} onChange={e => setBudget(parseInt(e.target.value))} style={{ width: '100%', maxWidth: '400px' }} />
        </div>

        {/* Risk */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Risk tolerance</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {RISK_LEVELS.map(r => (
              <button key={r} onClick={() => setRisk(r)} style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem', border: '1px solid var(--border)', cursor: 'pointer', background: risk === r ? 'var(--field)' : 'var(--surface-2)', color: risk === r ? 'white' : 'var(--text-secondary)' }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setGenerated(true)}
          style={{ padding: '0.75rem 2rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, alignSelf: 'flex-start' }}
        >
          Generate strategy →
        </button>
      </div>

      {generated && (
        <div style={{ background: 'var(--surface-2)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '12px', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--field)' }}>Your starting strategy</h2>
          {[
            { label: 'First purchase', value: strategy.firstPurchase },
            { label: 'First income source', value: strategy.firstIncome },
            { label: 'First crop', value: strategy.firstCrop },
            { label: 'Phase 1 goal', value: strategy.phase1Goal },
            { label: 'Phase 2 goal', value: strategy.phase2Goal },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
              <div style={{ width: '140px', flexShrink: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '2px' }}>{label}</div>
              <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{value}</div>
            </div>
          ))}
          <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(74,124,63,0.08)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            💡 {strategy.tip}
          </div>
        </div>
      )}
    </main>
  )
}
