'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  maps: any[]
  activeMapSlug: string
  chains: any[]
  hasFinancialData: boolean
}

// Clean display names - strip map suffixes
function cleanName(raw: string): string {
  const NAMES: Record<string, string> = {
    'Bakery': 'Bakery',
    'Canning/Preserved Food': 'Canning & Preserved Food',
    'Carpentry': 'Carpentry',
    'Cement Factory': 'Cement Factory',
    'Cereal Factory': 'Cereal Factory',
    'Cooper': 'Cooper',
    'Dairy': 'Dairy',
    'Grain Mill': 'Grain Mill',
    'Grape Processing Unit': 'Grape Processing Unit',
    'Oil Mill': 'Oil Mill',
    'Paper Factory': 'Paper Factory',
    'Potato Processing Plant': 'Potato Processing Plant',
    'Rope Maker': 'Rope Maker',
    'Sawmill': 'Sawmill',
    'Sawmill Wood-Mizer LT15': 'Sawmill (Wood-Mizer LT15)',
    'Soup Factory': 'Soup Factory',
    'Spinnery': 'Spinnery',
    'Sugar Mill': 'Sugar Mill',
    'Tailor Shop': 'Tailor Shop',
    'Piano Factory': 'Piano Factory',
    'Preserved Food Factory': 'Preserved Food Factory',
    'Dredging Boat': 'Dredging Boat',
  }
  // Try direct match first
  if (NAMES[raw]) return NAMES[raw]
  // Strip map suffixes
  return raw
    .replace(/US$/, '').replace(/AS$/, '').replace(/EU$/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\bMill\b/, 'Mill')
    .trim()
}

const fmt = (n: number | null | undefined) =>
  n != null ? `$${Math.abs(n).toLocaleString()}` : '—'

const fmtSigned = (n: number | null | undefined) => {
  if (n == null) return '—'
  const s = Math.abs(n).toLocaleString()
  return n < 0 ? `-$${s}` : `$${s}`
}

const NET_COLOR = (n: number | null | undefined) => {
  if (n == null) return 'var(--text-muted)'
  if (n < 0) return '#e07070'
  if (n > 50000) return 'var(--field)'
  return 'var(--text-primary)'
}

export default function ProductionPlannerClient({ maps, activeMapSlug, chains, hasFinancialData }: Props) {
  const router = useRouter()
  const [search, setSearch]         = useState('')
  const [expanded, setExpanded]     = useState<Set<string>>(new Set())
  const [sortChains, setSortChains] = useState<'name' | 'monthly_net' | 'annual_net'>('monthly_net')

  const MAP_NAMES: Record<string, string> = {
    riverbend_springs: 'Riverbend Springs',
    hutan_pantai:      'Hutan Pantai',
    zielonka:          'Zielonka',
    kinlaig:           'Kinlaig',
  }

  // Group by factory name
  const factories = chains.reduce<Record<string, any[]>>((acc, chain) => {
    const key = chain.factory_name ?? chain.name?.split(' — ')[0] ?? 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(chain)
    return acc
  }, {})

  const filteredFactories = Object.entries(factories).filter(([name, fchains]) => {
    if (!search) return true
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) ||
      fchains.some(c => (c.product_name ?? '').toLowerCase().includes(q))
  })

  const toggleFactory = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(Object.keys(factories)))
  const collapseAll = () => setExpanded(new Set())

  return (
    <div>
      {/* Map tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['riverbend_springs', 'hutan_pantai', 'zielonka'].map(slug => (
          <button key={slug} onClick={() => router.push(`/tools/production-planner?map=${slug}`)}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500, background: activeMapSlug === slug ? 'var(--field)' : 'var(--surface-2)', color: activeMapSlug === slug ? 'white' : 'var(--text-secondary)' }}>
            {MAP_NAMES[slug]}
          </button>
        ))}
      </div>

      {!hasFinancialData && (
        <div style={{ padding: '0.875rem 1.125rem', background: 'rgba(200,137,42,0.08)', border: '1px solid rgba(200,137,42,0.2)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--harvest)' }}>
          Showing basic chain data. Run the seed-factory-chains.sql script in Supabase to unlock full financial data for this map.
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input type="text" placeholder="Search factories or products..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.875rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1, minWidth: '200px' }} />
        {hasFinancialData && (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[['monthly_net', 'Monthly net'], ['annual_net', 'Annual net'], ['name', 'Name']] .map(([v, l]) => (
              <button key={v} onClick={() => setSortChains(v as any)}
                style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border)', cursor: 'pointer', background: sortChains === v ? 'var(--field)' : 'var(--surface-2)', color: sortChains === v ? 'white' : 'var(--text-secondary)' }}>
                {l}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={expandAll} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>Expand all</button>
          <button onClick={collapseAll} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>Collapse all</button>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{filteredFactories.length} factories</span>
      </div>

      {/* Factory list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredFactories.map(([factoryName, fchains]) => {
          const isOpen = expanded.has(factoryName)
          const sample = fchains[0]
          const purchasePrice = sample?.factory_purchase_price
          const monthlyGross  = sample?.factory_monthly_gross
          const monthlyNet    = sample?.factory_monthly_net
          const annualNet     = sample?.factory_annual_net

          const sortedChains = [...fchains].sort((a, b) => {
            if (sortChains === 'name') return (a.product_name ?? '').localeCompare(b.product_name ?? '')
            if (sortChains === 'annual_net') return (b.annual_net ?? 0) - (a.annual_net ?? 0)
            return (b.monthly_net ?? 0) - (a.monthly_net ?? 0)
          })

          return (
            <div key={factoryName} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Factory header */}
              <div
                onClick={() => toggleFactory(factoryName)}
                style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {factoryName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '2px 8px', background: 'var(--surface-3)', borderRadius: '4px' }}>
                    {fchains.length} chain{fchains.length !== 1 ? 's' : ''}
                  </span>
                  {purchasePrice && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ${purchasePrice.toLocaleString()} purchase
                    </span>
                  )}
                </div>
                {hasFinancialData && monthlyNet != null && (
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly gross</div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(monthlyGross)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly net</div>
                      <div style={{ fontWeight: 700, color: NET_COLOR(monthlyNet), fontVariantNumeric: 'tabular-nums' }}>{fmtSigned(monthlyNet)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annual net</div>
                      <div style={{ fontWeight: 600, color: NET_COLOR(annualNet), fontVariantNumeric: 'tabular-nums' }}>{fmtSigned(annualNet)}</div>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                )}
                {!hasFinancialData && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{isOpen ? '▲' : '▼'}</span>
                )}
              </div>

              {/* Chain rows */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {sortedChains.map((chain, i) => {
                    const ingredients: any[] = chain.ingredients ?? []
                    return (
                      <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: i < sortedChains.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: ingredients.length > 0 ? '0.75rem' : 0 }}>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                              {chain.product_name ?? chain.name}
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {chain.cycles_per_month && <span>{chain.cycles_per_month} cycles/mo</span>}
                              {chain.output_amount_l && <span>→ {chain.output_amount_l}L output</span>}
                              {chain.sell_price_per_1000l && <span>${chain.sell_price_per_1000l.toLocaleString()}/1000L</span>}
                              {chain.cost_per_cycle && <span>${chain.cost_per_cycle}/cycle cost</span>}
                            </div>
                          </div>
                          {hasFinancialData && (
                            <div style={{ display: 'flex', gap: '1.25rem', flexShrink: 0, flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mo. gross</div>
                                <div style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{fmt(chain.monthly_gross)}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mo. net</div>
                                <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: NET_COLOR(chain.monthly_net) }}>{fmtSigned(chain.monthly_net)}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annual net</div>
                                <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: NET_COLOR(chain.annual_net) }}>{fmtSigned(chain.annual_net)}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ingredients */}
                        {ingredients.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {ingredients.map((ing: any, j: number) => (
                              <span key={j} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(59,123,191,0.1)', color: 'var(--sky)', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                {ing.name}
                                {ing.amount_per_cycle && <span style={{ opacity: 0.7 }}>×{ing.amount_per_cycle}</span>}
                                {ing.purchase && ing.price_per_1000l ? <span style={{ opacity: 0.6 }}>${ing.price_per_1000l.toLocaleString()}/k</span> : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {chains.length === 0 && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
          No production data for this map yet.
        </div>
      )}
    </div>
  )
}
