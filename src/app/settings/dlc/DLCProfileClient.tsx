'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DLC } from '@/types/database'
import { SEASON_PASS_CONTENTS } from '@/lib/dlc'

interface Props {
  dlcs: DLC[]
  ownedIds: string[]
  userId: string
}

const TIER_LABELS: Record<string, string> = {
  major:        'Major DLC',
  machine_pack: 'Machine packs',
  season_pass:  'Season passes',
  cosmetic:     'Cosmetic',
}

const TIER_ORDER = ['season_pass', 'major', 'machine_pack', 'cosmetic']

export default function DLCProfileClient({ dlcs, ownedIds, userId }: Props) {
  const [owned, setOwned] = useState<Set<string>>(new Set(ownedIds))
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const toggle = async (dlc: DLC) => {
    if (dlc.free_default) return // can't toggle free defaults

    const supabase = createClient()
    const isNowOwned = !owned.has(dlc.id)

    setSaving(dlc.id)

    const nextOwned = new Set(owned)

    // If this is a season pass being turned ON, also add its contents
    const passContents = SEASON_PASS_CONTENTS[dlc.slug]
    if (isNowOwned && passContents) {
      const contentDLCs = dlcs.filter(d => passContents.includes(d.slug))
      for (const child of contentDLCs) {
        nextOwned.add(child.id)
        await supabase.from('user_dlc_profile').upsert({
          user_id: userId, dlc_id: child.id, is_owned: true
        })
      }
    }

    if (isNowOwned) nextOwned.add(dlc.id)
    else nextOwned.delete(dlc.id)

    setOwned(nextOwned)

    await supabase.from('user_dlc_profile').upsert({
      user_id: userId,
      dlc_id: dlc.id,
      is_owned: isNowOwned,
    })

    setSaving(null)
    setSaved(prev => new Set([...prev, dlc.id]))
    setTimeout(() => setSaved(prev => { const s = new Set(prev); s.delete(dlc.id); return s }), 1500)
  }

  const byTier = TIER_ORDER.map(tier => ({
    tier,
    label: TIER_LABELS[tier],
    items: dlcs.filter(d => d.tier === tier),
  })).filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {byTier.map(({ tier, label, items }) => (
        <section key={tier}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {label}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map(dlc => {
              const isFree    = dlc.free_default
              const isOwned   = isFree || owned.has(dlc.id)
              const isSaving  = saving === dlc.id
              const justSaved = saved.has(dlc.id)

              return (
                <div
                  key={dlc.id}
                  onClick={() => !isFree && toggle(dlc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1rem',
                    background: isOwned ? 'rgba(74, 124, 63, 0.08)' : 'var(--surface-2)',
                    border: `1px solid ${isOwned ? 'rgba(74, 124, 63, 0.35)' : 'var(--border)'}`,
                    borderRadius: '10px',
                    cursor: isFree ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    userSelect: 'none',
                  }}
                >
                  {/* Toggle */}
                  <div style={{
                    width: '36px', height: '20px', flexShrink: 0,
                    background: isOwned ? 'var(--field)' : 'var(--surface-3)',
                    borderRadius: '10px', position: 'relative',
                    transition: 'background 0.2s',
                    opacity: isFree ? 0.5 : 1,
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px',
                      left: isOwned ? '19px' : '3px',
                      width: '14px', height: '14px',
                      background: 'white', borderRadius: '50%',
                      transition: 'left 0.2s',
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {dlc.name}
                      {isFree && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(74,124,63,0.2)', color: 'var(--field)', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                          free · always on
                        </span>
                      )}
                      {justSaved && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>saved</span>
                      )}
                    </div>
                    {dlc.site_summary && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {dlc.site_summary}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {dlc.price === 0 ? 'Free' : `$${dlc.price.toFixed(2)}`}
                  </div>

                  {isSaving && (
                    <div style={{ width: '14px', height: '14px', border: '2px solid var(--field)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem' }}>
        Changes save automatically. Your profile is private and only used to filter content on this site.
      </p>
    </div>
  )
}
