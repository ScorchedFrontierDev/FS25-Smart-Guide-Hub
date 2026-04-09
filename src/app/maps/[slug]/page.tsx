import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getDLCContextForUser } from '@/lib/queries'
import { canAccessMap } from '@/lib/dlc'

export default async function MapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: map } = await supabase.from('maps').select('*').eq('slug', slug).single()
  if (!map) notFound()

  const ctx = user
    ? await getDLCContextForUser(user.id)
    : { ownedSlugs: new Set<string>(['precision_farming', 'straw_harvest']) }

  const accessible = canAccessMap(map.slug, ctx)

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← All maps</a>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>{map.name}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{map.unique_mechanic}</p>

      {!accessible && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(200, 137, 42, 0.1)', border: '1px solid rgba(200, 137, 42, 0.3)', borderRadius: '10px', marginBottom: '2rem', color: 'var(--harvest)' }}>
          This map requires the Highlands Fishing Expansion DLC.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Guides', href: `/guides?map=${slug}`, desc: 'Step-by-step strategies' },
          { label: 'Land Analyzer', href: `/tools/land?map=${slug}`, desc: 'Every field, price, and size' },
          { label: 'Production Planner', href: `/tools/production?map=${slug}`, desc: 'Optimal chains for your setup' },
          { label: 'Challenges', href: `/challenges?map=${slug}`, desc: 'Community scenarios' },
        ].map(item => (
          <a key={item.href} href={accessible ? item.href : '#'} style={{ padding: '1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', textDecoration: 'none', opacity: accessible ? 1 : 0.4 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.label}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
          </a>
        ))}
      </div>
    </main>
  )
}
