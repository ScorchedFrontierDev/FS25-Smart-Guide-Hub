import { createClient } from '@/lib/supabase/server'
import ProductionPlannerClient from './ProductionPlannerClient'

export default async function ProductionPlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ map?: string }>
}) {
  const { map: mapSlug } = await searchParams
  const activeMap = mapSlug ?? 'riverbend_springs'
  const supabase = await createClient()

  // Try factory_chains first (has full financial data)
  const { data: chains, error } = await supabase
    .from('factory_chains')
    .select('*')
    .eq('map_slug', activeMap)
    .order('factory_name')
    .order('monthly_net', { ascending: false })

  // Fall back to production_chains if factory_chains is empty
  let fallbackChains: any[] = []
  if (!chains || chains.length === 0) {
    const { data: maps } = await supabase.from('maps').select('id, slug').eq('slug', activeMap).single()
    if (maps) {
      const { data } = await supabase.from('production_chains').select('*').eq('map_id', (maps as any).id)
      fallbackChains = (data ?? []) as any[]
    }
  }

  const { data: maps } = await supabase.from('maps').select('slug, name').order('name')

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/tools" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Tools</a>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>Production Planner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Every production chain grouped by building with full financial data.
        </p>
      </div>
      <ProductionPlannerClient
        maps={(maps ?? []) as any[]}
        activeMapSlug={activeMap}
        chains={(chains ?? fallbackChains) as any[]}
        hasFinancialData={(chains?.length ?? 0) > 0}
      />
    </main>
  )
}
