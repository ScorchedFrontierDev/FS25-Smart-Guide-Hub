// Homepage — map selector
// Fetches maps server-side with explicit error handling

import { createClient } from '@/lib/supabase/server'

const MAP_DESCRIPTIONS: Record<string, { focus: string; color: string }> = {
  riverbend_springs: { focus: 'Grain, livestock, river logistics',  color: '#4a7c3f' },
  hutan_pantai:      { focus: 'Rice, water systems, aquaculture',   color: '#3b7bbf' },
  zielonka:          { focus: 'Vegetables, dense field network',    color: '#6b8c3f' },
  kinlaig:           { focus: 'Fishing, harbor economy',            color: '#2d6e8a' },
}

export default async function HomePage() {
  let maps: any[] = []
  let fetchError: string | null = null
  let user = null

  try {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    user = userData?.user ?? null

    const { data, error } = await supabase.from('maps').select('*').order('name')

    if (error) {
      fetchError = error.message
    } else {
      maps = data ?? []
    }
  } catch (e: any) {
    fetchError = e?.message ?? 'Unknown error'
  }

  return (
    <main style={{ minHeight: 'calc(100vh - 56px)', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '0.75rem' }}>
            FS25 Smart Guide Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '520px' }}>
            Personalized guides, tools, and challenges — adapted to your exact map and DLC setup.
          </p>
        </div>

        {/* Debug: show error if fetch failed */}
        {fetchError && (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(200, 60, 60, 0.1)', border: '1px solid rgba(200, 60, 60, 0.3)', borderRadius: '10px', marginBottom: '2rem', color: '#e07070', fontSize: '0.875rem' }}>
            <strong>Database error:</strong> {fetchError}
            <br />
            <span style={{ opacity: 0.7 }}>Check that your .env.local values are correct and the dev server was restarted after saving them.</span>
          </div>
        )}

        {/* Map grid */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Choose your map
          </h2>

          {maps.length === 0 && !fetchError && (
            <div style={{ padding: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No maps found in database. Make sure you ran the schema SQL in Supabase.
              <br /><br />
              <strong style={{ color: 'var(--text-secondary)' }}>Quick check:</strong> Go to Supabase → SQL Editor → run:{' '}
              <code style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px' }}>select * from maps;</code>
              {' '}— you should see 4 rows.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {maps.map(map => {
              const meta = MAP_DESCRIPTIONS[map.slug] ?? { focus: map.economy_type, color: '#4a7c3f' }
              return (
                <a
                  key={map.id}
                  href={`/maps/${map.slug}`}
                  style={{
                    display: 'block',
                    padding: '1.5rem',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s, transform 0.15s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: meta.color, opacity: 0.8 }} />

                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', marginTop: '0.25rem' }}>
                    {map.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                    {meta.focus}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {map.unique_mechanic}
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Auth CTA */}
        <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {user ? (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Signed in as {user.email} ·{' '}
              <a href="/dashboard" style={{ color: 'var(--field)', textDecoration: 'none' }}>Go to dashboard →</a>
            </span>
          ) : (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Sign in to save your progress, track challenges, and persist your DLC profile.
              </span>
              <a href="/auth/login" style={{ padding: '0.5rem 1rem', background: 'var(--field)', color: 'white', borderRadius: '7px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
                Sign in →
              </a>
            </>
          )}
        </div>

      </div>
    </main>
  )
}
