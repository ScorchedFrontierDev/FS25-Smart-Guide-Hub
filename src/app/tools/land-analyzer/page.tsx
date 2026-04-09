import { createClient } from '@/lib/supabase/server'
import LandAnalyzerClient from './LandAnalyzerClient'

export default async function LandAnalyzerPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string }>
}) {
  const { map: mapSlug } = await searchParams
  const supabase = await createClient()

  const { data: maps } = await supabase.from('maps').select('id, slug, name').order('name')
  const activeMap = maps?.find(m => m.slug === mapSlug) ?? maps?.[0] ?? null

  let farmlands: any[] = []
  if (activeMap) {
    const { data } = await supabase
      .from('farmlands')
      .select('*')
      .eq('map_id', activeMap.id)
      .order('price')
    farmlands = (data ?? []) as any[]
  }

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/tools" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Tools</a>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>Land Analyzer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Every farmland on each map with real prices from the game XML files.
          Price = base rate × price scale. Actual cost depends on field size (ha).
        </p>
      </div>
      <LandAnalyzerClient maps={maps ?? []} activeMap={activeMap} farmlands={farmlands} />
    </main>
  )
}
