import { createClient } from '@/lib/supabase/server'
import { buildDLCContext } from '@/lib/dlc'
import { getDLCContextForUser } from '@/lib/queries'

const TYPE_LABELS: Record<string, string> = {
  survival: 'Survival',
  standard: 'Standard',
  advanced: 'Advanced',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:     '#4a7c3f',
  standard: '#3b7bbf',
  hard:     '#c8892a',
  survival: '#a63d2f',
}

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string }>
}) {
  const { map: mapFilter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctx = user
    ? await getDLCContextForUser(user.id)
    : buildDLCContext([])

  // Fetch guides
  let query = supabase
    .from('guides')
    .select('*, maps(slug, name)')
    .eq('is_published', true)
    .order('guide_type')

  if (mapFilter) {
    const { data: map } = await supabase
      .from('maps')
      .select('id')
      .eq('slug', mapFilter)
      .single()
    if (map) query = query.or(`map_id.eq.${map.id},map_id.is.null`)
  }

  const { data: guidesRaw } = await query
  const { data: mapsRaw } = await supabase.from('maps').select('slug, name').order('name')

  const guides = (guidesRaw ?? []) as any[]
  const maps   = (mapsRaw  ?? []) as any[]

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>Guides</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Step-by-step strategies adapted to your map and DLC setup.
        </p>
      </div>

      {/* Map filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <a
          href="/guides"
          style={{
            padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem',
            textDecoration: 'none', fontWeight: 500,
            background: !mapFilter ? 'var(--field)' : 'var(--surface-2)',
            color: !mapFilter ? 'white' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          All maps
        </a>
        {maps.map((map: any) => (
          <a
            key={map.slug}
            href={`/guides?map=${map.slug}`}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: '6px', fontSize: '0.875rem',
              textDecoration: 'none', fontWeight: 500,
              background: mapFilter === map.slug ? 'var(--field)' : 'var(--surface-2)',
              color: mapFilter === map.slug ? 'white' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {map.name}
          </a>
        ))}
      </div>

      {/* Guide list */}
      {guides.length === 0 ? (
        <div style={{ padding: '2rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
          No guides yet. Run the seed SQL in Supabase to add the first guide.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {guides.map((guide: any) => (
            <a
              key={guide.id}
              href={`/guides/${guide.id}`}
              style={{
                display: 'block', padding: '1.25rem 1.5rem',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '12px', textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    {guide.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {(guide.maps as any)?.name ?? 'All maps'} · {guide.total_steps} steps
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                    background: `${DIFFICULTY_COLORS[guide.difficulty ?? 'standard']}22`,
                    color: DIFFICULTY_COLORS[guide.difficulty ?? 'standard'],
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {guide.difficulty ?? 'standard'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '4px',
                    background: 'var(--surface-3)', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {TYPE_LABELS[guide.guide_type] ?? guide.guide_type}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
