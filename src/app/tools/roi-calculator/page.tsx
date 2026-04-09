'use client'

import { useState } from 'react'

// All 25 crops — data from user spreadsheet (Riverbend Springs base values)
// Net income figures already account for seed costs
const CROPS = [
  { name: 'Barley',          growthMonths: 7,  seedCostPerHa: 333.90,  harvestLPerHa: 9600,   strawLPerHa: 36800, netPerHaExclStraw: 2671,  netPerHaInclStraw: 4180  },
  { name: 'Canola',          growthMonths: 4,  seedCostPerHa: 8.82,    harvestLPerHa: 5800,   strawLPerHa: 0,     netPerHaExclStraw: 3489,  netPerHaInclStraw: 3489  },
  { name: 'Carrots',         growthMonths: 6,  seedCostPerHa: 12.60,   harvestLPerHa: 77000,  strawLPerHa: 0,     netPerHaExclStraw: 10151, netPerHaInclStraw: 10151 },
  { name: 'Corn',            growthMonths: 5,  seedCostPerHa: 66.78,   harvestLPerHa: 9200,   strawLPerHa: 0,     netPerHaExclStraw: 3429,  netPerHaInclStraw: 3429  },
  { name: 'Cotton',          growthMonths: 8,  seedCostPerHa: 63.00,   harvestLPerHa: 4970,   strawLPerHa: 0,     netPerHaExclStraw: 6159,  netPerHaInclStraw: 6159  },
  { name: 'Grapes',          growthMonths: 5,  seedCostPerHa: 0,       harvestLPerHa: 9200,   strawLPerHa: 0,     netPerHaExclStraw: 5548,  netPerHaInclStraw: 5548  },
  { name: 'Grass',           growthMonths: 3,  seedCostPerHa: 151.20,  harvestLPerHa: 43700,  strawLPerHa: 0,     netPerHaExclStraw: 1815,  netPerHaInclStraw: 1815  },
  { name: 'Green Beans',     growthMonths: 4,  seedCostPerHa: 352.80,  harvestLPerHa: 6975,   strawLPerHa: 0,     netPerHaExclStraw: 4669,  netPerHaInclStraw: 4669  },
  { name: 'Long Grain Rice', growthMonths: 4,  seedCostPerHa: 630.00,  harvestLPerHa: 9000,   strawLPerHa: 0,     netPerHaExclStraw: 4140,  netPerHaInclStraw: 4140  },
  { name: 'Oat',             growthMonths: 4,  seedCostPerHa: 428.40,  harvestLPerHa: 5700,   strawLPerHa: 36800, netPerHaExclStraw: 2604,  netPerHaInclStraw: 4113  },
  { name: 'Oilseed Radish',  growthMonths: 1,  seedCostPerHa: 50.40,   harvestLPerHa: 9900,   strawLPerHa: 0,     netPerHaExclStraw: -50,   netPerHaInclStraw: -50   },
  { name: 'Olives',          growthMonths: 4,  seedCostPerHa: 0,       harvestLPerHa: 9200,   strawLPerHa: 0,     netPerHaExclStraw: 5548,  netPerHaInclStraw: 5548  },
  { name: 'Parsnips',        growthMonths: 4,  seedCostPerHa: 12.60,   harvestLPerHa: 69500,  strawLPerHa: 0,     netPerHaExclStraw: 9092,  netPerHaInclStraw: 9092  },
  { name: 'Peas',            growthMonths: 4,  seedCostPerHa: 315.00,  harvestLPerHa: 4800,   strawLPerHa: 0,     netPerHaExclStraw: 4677,  netPerHaInclStraw: 4677  },
  { name: 'Poplar',          growthMonths: 12, seedCostPerHa: 210.00,  harvestLPerHa: 28200,  strawLPerHa: 0,     netPerHaExclStraw: 918,   netPerHaInclStraw: 918   },
  { name: 'Potatoes',        growthMonths: 5,  seedCostPerHa: 3546.35, harvestLPerHa: 41300,  strawLPerHa: 0,     netPerHaExclStraw: 5622,  netPerHaInclStraw: 5622  },
  { name: 'Red Beet',        growthMonths: 4,  seedCostPerHa: 5.04,    harvestLPerHa: 57800,  strawLPerHa: 0,     netPerHaExclStraw: 7047,  netPerHaInclStraw: 7047  },
  { name: 'Rice',            growthMonths: 4,  seedCostPerHa: 196.88,  harvestLPerHa: 6600,   strawLPerHa: 0,     netPerHaExclStraw: 7063,  netPerHaInclStraw: 7063  },
  { name: 'Sorghum',         growthMonths: 4,  seedCostPerHa: 44.10,   harvestLPerHa: 8200,   strawLPerHa: 0,     netPerHaExclStraw: 3482,  netPerHaInclStraw: 3482  },
  { name: 'Soybeans',        growthMonths: 6,  seedCostPerHa: 269.64,  harvestLPerHa: 4500,   strawLPerHa: 0,     netPerHaExclStraw: 3231,  netPerHaInclStraw: 3231  },
  { name: 'Spinach',         growthMonths: 3,  seedCostPerHa: 12.60,   harvestLPerHa: 23100,  strawLPerHa: 0,     netPerHaExclStraw: 5069,  netPerHaInclStraw: 5069  },
  { name: 'Sugar Beet',      growthMonths: 7,  seedCostPerHa: 42.84,   harvestLPerHa: 57800,  strawLPerHa: 0,     netPerHaExclStraw: 9899,  netPerHaInclStraw: 9899  },
  { name: 'Sugar Cane',      growthMonths: 7,  seedCostPerHa: 2280.00, harvestLPerHa: 113400, strawLPerHa: 0,     netPerHaExclStraw: 11215, netPerHaInclStraw: 11215 },
  { name: 'Sunflowers',      growthMonths: 7,  seedCostPerHa: 180.18,  harvestLPerHa: 5200,   strawLPerHa: 0,     netPerHaExclStraw: 3319,  netPerHaInclStraw: 3319  },
  { name: 'Wheat',           growthMonths: 7,  seedCostPerHa: 388.08,  harvestLPerHa: 8900,   strawLPerHa: 36800, netPerHaExclStraw: 2611,  netPerHaInclStraw: 4120  },
]

// Conversion constants
const HA_TO_ACRES = 2.47105
// Game uses EUR internally; approximate USD conversion
const EUR_TO_USD = 1.08

export default function ROICalculatorPage() {
  const [fieldSize, setFieldSize]       = useState(2)
  const [useAcres, setUseAcres]         = useState(false)
  const [useUSD, setUseUSD]             = useState(true)
  const [includeStraw, setIncludeStraw] = useState(false)
  const [sortBy, setSortBy]             = useState<'net_per_harvest' | 'net_per_month'>('net_per_harvest')
  const [search, setSearch]             = useState('')

  // Field size displayed in chosen unit
  const fieldSizeHa     = useAcres ? fieldSize / HA_TO_ACRES : fieldSize
  const fieldSizeLabel  = useAcres ? `${fieldSize} ac` : `${fieldSize} ha`
  const areaUnitLabel   = useAcres ? 'ac' : 'ha'
  const currencyRate    = useUSD ? EUR_TO_USD : 1
  const currencySymbol  = useUSD ? '$' : '€'

  const convert = (eur: number) => eur * currencyRate

  const fmt = (n: number) =>
    `${currencySymbol}${Math.abs(convert(n)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  const fmtSigned = (n: number) =>
    n < 0
      ? `-${currencySymbol}${Math.abs(convert(n)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : fmt(n)

  const results = CROPS
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .map(c => {
      const netPerHa      = includeStraw ? c.netPerHaInclStraw : c.netPerHaExclStraw
      // Scale per-ha values to the chosen area unit for display
      const netPerAreaUnit = useAcres ? netPerHa / HA_TO_ACRES : netPerHa
      const seedPerAreaUnit = useAcres ? c.seedCostPerHa / HA_TO_ACRES : c.seedCostPerHa
      const harvestPerAreaUnit = useAcres
        ? Math.round(c.harvestLPerHa / HA_TO_ACRES)
        : c.harvestLPerHa
      const netPerHarvest  = netPerHa * fieldSizeHa
      const netPerMonth    = netPerHarvest / c.growthMonths
      return { ...c, netPerHa, netPerAreaUnit, seedPerAreaUnit, harvestPerAreaUnit, netPerHarvest, netPerMonth }
    })
    .sort((a, b) => sortBy === 'net_per_harvest'
      ? b.netPerHarvest - a.netPerHarvest
      : b.netPerMonth - a.netPerMonth
    )

  const best = results[0]?.netPerHarvest ?? 1

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.35rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem',
    border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500,
    background: active ? 'var(--field)' : 'var(--surface-2)',
    color: active ? 'white' : 'var(--text-secondary)',
  })

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/tools" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Tools</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>ROI Calculator</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        All 25 crops with real data. Net income already accounts for seed costs.
      </p>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)' }}>

        {/* Field size */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
            Field size — {fieldSizeLabel}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="range"
              min={useAcres ? 1 : 0.5}
              max={useAcres ? 75 : 30}
              step={useAcres ? 0.5 : 0.5}
              value={fieldSize}
              onChange={e => setFieldSize(parseFloat(e.target.value))}
              style={{ flex: 1 }}
            />
            <input type="number"
              min={useAcres ? 1 : 0.5}
              max={useAcres ? 75 : 30}
              step={useAcres ? 0.5 : 0.5}
              value={fieldSize}
              onChange={e => setFieldSize(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              style={{ width: '64px', padding: '0.3rem 0.5rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.875rem', textAlign: 'center' }}
            />
          </div>
        </div>

        {/* Area unit */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Area</label>
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button onClick={() => { setUseAcres(false); setFieldSize(Math.round(fieldSize / HA_TO_ACRES * 2) / 2 || 0.5) }}
              style={{ ...toggleStyle(!useAcres), borderRadius: 0, border: 'none' }}>
              Hectares
            </button>
            <button onClick={() => { setUseAcres(true); setFieldSize(Math.round(fieldSize * HA_TO_ACRES * 2) / 2 || 1) }}
              style={{ ...toggleStyle(useAcres), borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border)' }}>
              Acres
            </button>
          </div>
        </div>

        {/* Currency */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Currency</label>
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button onClick={() => setUseUSD(true)}
              style={{ ...toggleStyle(useUSD), borderRadius: 0, border: 'none' }}>
              USD ($)
            </button>
            <button onClick={() => setUseUSD(false)}
              style={{ ...toggleStyle(!useUSD), borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border)' }}>
              EUR (€)
            </button>
          </div>
        </div>

        {/* Sort */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Sort by</label>
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <button onClick={() => setSortBy('net_per_harvest')}
              style={{ ...toggleStyle(sortBy === 'net_per_harvest'), borderRadius: 0, border: 'none' }}>
              Per harvest
            </button>
            <button onClick={() => setSortBy('net_per_month')}
              style={{ ...toggleStyle(sortBy === 'net_per_month'), borderRadius: 0, border: 'none', borderLeft: '1px solid var(--border)' }}>
              Per month
            </button>
          </div>
        </div>

        {/* Straw toggle */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Straw</label>
          <button onClick={() => setIncludeStraw(s => !s)} style={toggleStyle(includeStraw)}>
            {includeStraw ? '+ Included' : 'Excluded'}
          </button>
        </div>

        {/* Search */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Filter</label>
          <input type="text" placeholder="Search crops..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.45rem 0.875rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.875rem', boxSizing: 'border-box' as any }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-3)', borderBottom: '1px solid var(--border)' }}>
              {[
                'Crop',
                'Growth',
                `Harvest/${areaUnitLabel}`,
                `Seed cost/${areaUnitLabel}`,
                `Net/${areaUnitLabel}`,
                `Net (${fieldSizeLabel})`,
                'Net/month',
                'Straw',
              ].map(h => (
                <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((c, i) => {
              const barWidth = Math.max(4, (c.netPerHarvest / best) * 100)
              const isTop = i === 0
              const isNeg = c.netPerHarvest < 0
              return (
                <tr key={c.name} style={{ background: i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: isTop ? 'var(--field)' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {isTop && <span style={{ marginRight: '0.35rem', color: 'var(--harvest)' }}>★</span>}
                    {c.name}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {c.growthMonths} mo
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {c.harvestPerAreaUnit.toLocaleString()} L
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {fmt(c.seedPerAreaUnit)}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: isNeg ? '#e07070' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {fmtSigned(c.netPerAreaUnit)}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '56px', height: '5px', background: 'var(--surface-3)', borderRadius: '3px', flexShrink: 0 }}>
                        <div style={{ height: '100%', width: `${barWidth}%`, background: isNeg ? '#a63d2f' : isTop ? 'var(--harvest)' : 'var(--field)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: isTop ? 700 : 500, color: isNeg ? '#e07070' : isTop ? 'var(--harvest)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {fmtSigned(c.netPerHarvest)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {fmtSigned(c.netPerMonth)}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {c.strawLPerHa > 0
                      ? useAcres
                        ? `${Math.round(c.strawLPerHa / HA_TO_ACRES).toLocaleString()} L/${areaUnitLabel}`
                        : `${c.strawLPerHa.toLocaleString()} L/${areaUnitLabel}`
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '0.875rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <span>Net income includes seed costs. Excludes fertilizer, fuel, and equipment.</span>
        {useUSD && <span>EUR → USD conversion at 1.08 rate (approximate).</span>}
        <span>Straw income applies to Barley, Oat, and Wheat only.</span>
      </div>
    </main>
  )
}
