'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  maps: any[]
  activeMap: any
  farmlands: any[]
}

const NPC_LABELS: Record<string, string> = {
  GRANDPA:       'Grandpa (starter)',
  FARMER:        'Farmer',
  FORESTER:      'Forester',
  HELPER:        'Helper',
  ANIMAL_DEALER: 'Animal Dealer',
}

export default function LandAnalyzerClient({ maps, activeMap, farmlands }: Props) {
  const router = useRouter()
  const [search, setSearch]     = useState('')
  const [sortBy, setSortBy]     = useState<'price' | 'game_id'>('price')
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [filterNpc, setFilterNpc] = useState('')

  const npcs = [...new Set(farmlands.map((f: any) => f._npc_name).filter(Boolean))]

  const filtered = farmlands
    .filter((f: any) => {
      if (search && !String(f.game_id).includes(search)) return false
      if (filterNpc && f._npc_name !== filterNpc) return false
      return true
    })
    .sort((a: any, b: any) => {
      const av = a[sortBy] ?? 0
      const bv = b[sortBy] ?? 0
      return sortDir === 'asc' ? av - bv : bv - av
    })

  const toggleSort = (col: 'price' | 'game_id') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const thStyle = (col: string): React.CSSProperties => ({
    padding: '0.6rem 0.75rem', textAlign: 'left', fontSize: '0.75rem',
    fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', cursor: 'pointer', userSelect: 'none',
    background: 'var(--surface-3)', borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  })

  return (
    <div>
      {/* Map tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {maps.map((map: any) => (
          <button
            key={map.slug}
            onClick={() => router.push(`/tools/land-analyzer?map=${map.slug}`)}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem',
              border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 500,
              background: activeMap?.slug === map.slug ? 'var(--field)' : 'var(--surface-2)',
              color: activeMap?.slug === map.slug ? 'white' : 'var(--text-secondary)',
            }}
          >
            {map.name}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search field ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.5rem 0.875rem', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: '7px',
            color: 'var(--text-primary)', fontSize: '0.875rem', width: '160px',
          }}
        />
        <select
          value={filterNpc}
          onChange={e => setFilterNpc(e.target.value)}
          style={{
            padding: '0.5rem 0.875rem', background: 'var(--surface-2)',
            border: '1px solid var(--border)', borderRadius: '7px',
            color: 'var(--text-secondary)', fontSize: '0.875rem',
          }}
        >
          <option value="">All owners</option>
          {(npcs as string[]).map(npc => (
            <option key={npc} value={npc}>{NPC_LABELS[npc] ?? npc}</option>
          ))}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filtered.length} of {farmlands.length} fields
        </div>
      </div>

      {/* Table */}
      {farmlands.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          No farmland data for this map yet. Run the XML import script first.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={thStyle('game_id')} onClick={() => toggleSort('game_id')}>
                  Field ID {sortBy === 'game_id' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={thStyle('price')} onClick={() => toggleSort('price')}>
                  Base Price/ha {sortBy === 'price' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th style={{ ...thStyle(''), cursor: 'default' }}>Price Scale</th>
                <th style={{ ...thStyle(''), cursor: 'default' }}>Owner NPC</th>
                <th style={{ ...thStyle(''), cursor: 'default' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f: any, i: number) => (
                <tr
                  key={f.id}
                  style={{ background: i % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)', borderBottom: '1px solid var(--border)' }}
                >
                  <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Field {f.game_id}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    ${f.price?.toLocaleString() ?? '—'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>
                    {f._price_scale ?? '1.0'}×
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-secondary)' }}>
                    {NPC_LABELS[f._npc_name] ?? f._npc_name ?? '—'}
                  </td>
                  <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {f._is_default ? 'Starter property' : ''}
                    {!f._show_on_screen ? 'Hidden (special)' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        Prices shown are base rate per hectare × price scale. Actual purchase price = this × field size in hectares.
        Field sizes are stored in the game's 3D scene file and will be added in a future update.
      </p>
    </div>
  )
}
