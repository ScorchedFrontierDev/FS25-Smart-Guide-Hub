'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  challenges: any[]
  userId: string
}

export default function AdminChallengesClient({ challenges: initial, userId }: Props) {
  const [challenges, setChallenges] = useState(initial)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string) => {
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('challenges').update({ status: 'approved', reviewed_by: userId, reviewed_at: new Date().toISOString() }).eq('id', id)
    setChallenges(prev => prev.filter(c => c.id !== id))
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    if (!rejectReason) return
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('challenges').update({ status: 'rejected', rejection_reason: rejectReason, reviewed_by: userId, reviewed_at: new Date().toISOString() }).eq('id', id)
    setChallenges(prev => prev.filter(c => c.id !== id))
    setRejectReason('')
    setProcessing(null)
  }

  if (challenges.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
      No pending challenges.
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {challenges.map((c: any) => (
        <div key={c.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {(c.maps as any)?.name} · {c.category} · submitted {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{expanded === c.id ? '▲' : '▼'}</span>
          </div>

          {expanded === c.id && (
            <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  ['Hook', c.hook],
                  ['Rules', c.scenario_rules],
                  ['Phase 1', c.phase_1],
                  ['Phase 2', c.phase_2],
                  ['Phase 3', c.phase_3],
                  ['Win condition', c.win_condition],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '90px', flexShrink: 0, fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '2px' }}>{label}</div>
                    <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleApprove(c.id)} disabled={!!processing} style={{ padding: '0.5rem 1.25rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                  Approve
                </button>
                <input
                  placeholder="Rejection reason (required to reject)"
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.875rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <button onClick={() => handleReject(c.id)} disabled={!rejectReason || !!processing} style={{ padding: '0.5rem 1rem', background: 'var(--surface-3)', color: '#e07070', border: '1px solid rgba(200,60,60,0.3)', borderRadius: '7px', cursor: rejectReason ? 'pointer' : 'not-allowed', fontSize: '0.875rem', opacity: rejectReason ? 1 : 0.5 }}>
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
