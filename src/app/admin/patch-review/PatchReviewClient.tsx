'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pending: any[]
  recent: any[]
  userId: string
}

export default function PatchReviewClient({ pending: initialPending, recent, userId }: Props) {
  const [pending, setPending] = useState(initialPending)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('patch_import_log').update({
      status: action,
      approved_at: new Date().toISOString(),
      approved_by: userId,
    }).eq('id', id)
    setPending(prev => prev.filter(p => p.id !== id))
    setProcessing(null)
  }

  const handleApproveAll = async () => {
    const supabase = createClient()
    const ids = pending.map(p => p.id)
    await supabase.from('patch_import_log').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: userId,
    }).in('id', ids)
    setPending([])
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
          Pending ({pending.length})
        </h2>
        {pending.length > 0 && (
          <button onClick={handleApproveAll} style={{ padding: '0.4rem 1rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
            Approve all
          </button>
        )}
      </div>

      {pending.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', marginBottom: '2rem' }}>
          No pending changes. Run the import script to check for updates.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          {pending.map((p: any) => (
            <div key={p.id} style={{ padding: '1rem 1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  {p.table_affected} · record {p.record_game_id} · {p.field_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {p.field_name === '__new_record__'
                    ? 'New record'
                    : <>{p.old_value} → <strong>{p.new_value}</strong></>
                  }
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Patch {p.patch_version} · {new Date(p.flagged_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleAction(p.id, 'approved')} disabled={processing === p.id}
                  style={{ padding: '0.4rem 0.875rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                  Approve
                </button>
                <button onClick={() => handleAction(p.id, 'rejected')} disabled={processing === p.id}
                  style={{ padding: '0.4rem 0.875rem', background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Recent actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {recent.map((p: any) => (
              <div key={p.id} style={{ padding: '0.75rem 1rem', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{p.table_affected} · {p.record_game_id} · {p.field_name}</span>
                <span style={{ color: p.status === 'approved' ? 'var(--field)' : '#e07070', fontWeight: 600 }}>{p.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
