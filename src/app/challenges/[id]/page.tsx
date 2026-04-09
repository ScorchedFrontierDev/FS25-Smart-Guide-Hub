import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

const DIFFICULTY_STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: challenge } = await supabase
    .from('challenges')
    .select('*, maps(name, slug)')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!challenge) notFound()
  const c = challenge as any

  // Check if user is already playing
  let progress = null
  if (user) {
    const { data } = await supabase.from('user_challenge_progress').select('*').eq('user_id', user.id).eq('challenge_id', id).single()
    progress = data
  }

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/challenges" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Challenges</a>

      <div style={{ margin: '1rem 0 2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{c.title}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>{(c.maps as any)?.name ?? 'Any map'}</span>
          <span>·</span>
          <span style={{ textTransform: 'capitalize' }}>{c.category}</span>
          {c.difficulty && <><span>·</span><span style={{ color: 'var(--harvest)' }}>{DIFFICULTY_STARS(c.difficulty)}</span></>}
          {c.starting_budget && <><span>·</span><span>Start: ${c.starting_budget.toLocaleString()}</span></>}
        </div>
      </div>

      {c.hook && <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>{c.hook}</p>}

      {c.scenario_rules && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(200,137,42,0.08)', border: '1px solid rgba(200,137,42,0.2)', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--harvest)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Rules</div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.scenario_rules}</p>
        </div>
      )}

      {[
        { label: 'Phase 1', value: c.phase_1 },
        { label: 'Phase 2', value: c.phase_2 },
        { label: 'Phase 3', value: c.phase_3 },
        { label: 'Win condition', value: c.win_condition },
      ].filter(p => p.value).map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ width: '100px', flexShrink: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '2px' }}>{label}</div>
          <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{value}</div>
        </div>
      ))}

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        {!user ? (
          <a href="/auth/login" style={{ padding: '0.75rem 1.5rem', background: 'var(--field)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>
            Sign in to start this challenge →
          </a>
        ) : progress ? (
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You are playing this challenge — status: <strong style={{ color: 'var(--text-primary)' }}>{progress.status}</strong>
          </div>
        ) : (
          <form action={`/api/challenges/${id}/start`} method="POST">
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Start this challenge →
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
