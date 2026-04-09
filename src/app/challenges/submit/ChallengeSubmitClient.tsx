'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  maps: any[]
  dlcs: any[]
  userId: string
}

const CATEGORIES = ['financial', 'roleplay', 'equipment', 'competitive']
const CATEGORY_FIELDS: Record<string, string[]> = {
  financial:   ['starting_budget', 'scenario_rules'],
  roleplay:    ['scenario_rules'],
  equipment:   ['scenario_rules'],
  competitive: ['scenario_rules'],
}

export default function ChallengeSubmitClient({ maps, dlcs, userId }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  const [form, setForm] = useState({
    title:          '',
    category:       'financial',
    map_id:         maps[0]?.id ?? '',
    difficulty:     3,
    starting_budget: '',
    scenario_rules: '',
    hook:           '',
    phase_1:        '',
    phase_2:        '',
    phase_3:        '',
    win_condition:  '',
    mods_required:  '',
  })
  const [requiredDlcs, setRequiredDlcs] = useState<string[]>([])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const toggleDlc = (id: string) =>
    setRequiredDlcs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])

  const handleSubmit = async () => {
    if (!form.title || !form.win_condition) {
      setError('Title and win condition are required.')
      return
    }
    setSubmitting(true)
    setError('')
    const supabase = createClient()

    const { data: challenge, error: err } = await supabase
      .from('challenges')
      .insert({
        author_id:      userId,
        map_id:         form.map_id,
        title:          form.title,
        category:       form.category,
        difficulty:     form.difficulty,
        starting_budget: form.starting_budget ? parseFloat(form.starting_budget) : null,
        scenario_rules: form.scenario_rules || null,
        hook:           form.hook || null,
        phase_1:        form.phase_1 || null,
        phase_2:        form.phase_2 || null,
        phase_3:        form.phase_3 || null,
        win_condition:  form.win_condition,
        mods_required:  form.mods_required || null,
        status:         'pending',
      })
      .select('id')
      .single()

    if (err || !challenge) { setError(err?.message ?? 'Submission failed.'); setSubmitting(false); return }

    if (requiredDlcs.length > 0) {
      await supabase.from('challenge_dlc_requirements').insert(
        requiredDlcs.map(dlc_id => ({ challenge_id: challenge.id, dlc_id }))
      )
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) return (
    <div style={{ padding: '2rem', background: 'rgba(74,124,63,0.08)', border: '1px solid rgba(74,124,63,0.3)', borderRadius: '12px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--field)', marginBottom: '0.5rem' }}>Challenge submitted!</div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>It will go live after admin review. You will be notified when it is approved.</p>
      <a href="/challenges" style={{ color: 'var(--field)', textDecoration: 'none', fontWeight: 600 }}>← Back to challenges</a>
    </div>
  )

  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.625rem 0.875rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }
  const fieldStyle: React.CSSProperties = { marginBottom: '1.25rem' }

  return (
    <div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. The $0 Survival Challenge" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Map</label>
          <select style={inputStyle} value={form.map_id} onChange={e => set('map_id', e.target.value)}>
            {maps.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Difficulty (1–5)</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => set('difficulty', n)} style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 700, background: form.difficulty === n ? 'var(--harvest)' : 'var(--surface-2)', color: form.difficulty === n ? 'white' : 'var(--text-secondary)' }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {(form.category === 'financial' || form.category === 'roleplay') && (
        <div style={fieldStyle}>
          <label style={labelStyle}>Starting budget ($)</label>
          <input style={inputStyle} type="number" value={form.starting_budget} onChange={e => set('starting_budget', e.target.value)} placeholder="0 for survival start" />
        </div>
      )}

      <div style={fieldStyle}>
        <label style={labelStyle}>Hook — one sentence sell</label>
        <input style={inputStyle} value={form.hook} onChange={e => set('hook', e.target.value)} placeholder="What makes this challenge interesting?" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Scenario rules</label>
        <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={form.scenario_rules} onChange={e => set('scenario_rules', e.target.value)} placeholder="What restrictions apply? What can't the player do?" />
      </div>

      {['phase_1', 'phase_2', 'phase_3'].map(p => (
        <div key={p} style={fieldStyle}>
          <label style={labelStyle}>{p.replace('_', ' ').toUpperCase()}</label>
          <input style={inputStyle} value={(form as any)[p]} onChange={e => set(p, e.target.value)} placeholder={`What should the player achieve in ${p.replace('_', ' ')}?`} />
        </div>
      ))}

      <div style={fieldStyle}>
        <label style={labelStyle}>Win condition *</label>
        <input style={inputStyle} value={form.win_condition} onChange={e => set('win_condition', e.target.value)} placeholder="How does the player win?" />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Required DLCs</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(dlcs as any[]).filter(d => d.tier !== 'cosmetic').map((d: any) => (
            <button key={d.id} onClick={() => toggleDlc(d.id)} style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', border: '1px solid var(--border)', cursor: 'pointer', background: requiredDlcs.includes(d.id) ? 'var(--sky)' : 'var(--surface-2)', color: requiredDlcs.includes(d.id) ? 'white' : 'var(--text-secondary)' }}>
              {d.name}
            </button>
          ))}
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Mods required (optional)</label>
        <input style={inputStyle} value={form.mods_required} onChange={e => set('mods_required', e.target.value)} placeholder="List any required mods with links" />
      </div>

      {error && <div style={{ color: '#e07070', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      <button onClick={handleSubmit} disabled={submitting} style={{ padding: '0.75rem 2rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', opacity: submitting ? 0.7 : 1 }}>
        {submitting ? 'Submitting...' : 'Submit for review →'}
      </button>
    </div>
  )
}
