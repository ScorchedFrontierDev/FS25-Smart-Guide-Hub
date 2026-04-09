import { createClient } from '@/lib/supabase/server'
import { buildDLCContext } from '@/lib/dlc'
import { getDLCContextForUser } from '@/lib/queries'

const CATEGORY_COLORS: Record<string, string> = {
  financial:   '#c8892a',
  roleplay:    '#4a7c3f',
  equipment:   '#3b7bbf',
  competitive: '#a63d2f',
}

const DIFFICULTY_STARS = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string; category?: string }>
}) {
  const { map: mapFilter, category: catFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: maps } = await supabase.from('maps').select('slug, name').order('name')

  let query = supabase
    .from('challenges')
    .select('*, maps(slug, name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (mapFilter) {
    const { data: map } = await supabase.from('maps').select('id').eq('slug', mapFilter).single()
    if (map) query = query.eq('map_id', (map as any).id)
  }
  if (catFilter) query = query.eq('category', catFilter)

  const { data: challenges } = await query
  const list = (challenges ?? []) as any[]

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>Community Challenges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Browse and play challenges created by the community.</p>
        </div>
        {user && (
          <a href="/challenges/submit" style={{ padding: '0.6rem 1.25rem', background: 'var(--field)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0 }}>
            + Submit challenge
          </a>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['', 'financial', 'roleplay', 'equipment', 'competitive'].map(cat => (
          <a key={cat} href={`/challenges${cat ? `?category=${cat}` : ''}${mapFilter ? `${cat ? '&' : '?'}map=${mapFilter}` : ''}`}
            style={{ padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.82rem', textDecoration: 'none', border: '1px solid var(--border)', fontWeight: 500, background: catFilter === cat || (!catFilter && !cat) ? 'var(--field)' : 'var(--surface-2)', color: catFilter === cat || (!catFilter && !cat) ? 'white' : 'var(--text-secondary)' }}>
            {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'All'}
          </a>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No challenges yet</div>
          {user
            ? <a href="/challenges/submit" style={{ color: 'var(--field)', textDecoration: 'none' }}>Be the first to submit one →</a>
            : <a href="/auth/login" style={{ color: 'var(--field)', textDecoration: 'none' }}>Sign in to submit a challenge →</a>
          }
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {list.map((c: any) => (
            <a key={c.id} href={`/challenges/${c.id}`}
              style={{ display: 'block', padding: '1.25rem 1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', transition: 'border-color 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {(c.maps as any)?.name ?? 'Any map'}
                    {c.starting_budget ? ` · Start: $${c.starting_budget.toLocaleString()}` : ''}
                  </div>
                  {c.hook && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{c.hook}</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: `${CATEGORY_COLORS[c.category]}22`, color: CATEGORY_COLORS[c.category], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {c.category}
                  </span>
                  {c.difficulty && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--harvest)', letterSpacing: '0.05em' }}>
                      {DIFFICULTY_STARS(c.difficulty)}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
