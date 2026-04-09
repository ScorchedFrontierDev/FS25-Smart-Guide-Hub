import { createClient } from '@/lib/supabase/server'

const TOOLS = [
  {
    slug: 'land-analyzer',
    title: 'Land Analyzer',
    description: 'Compare every field by price, size, and value. Powered by real game data.',
    icon: '🌾',
    color: '#4a7c3f',
  },
  {
    slug: 'production-planner',
    title: 'Production Planner',
    description: 'Find the most profitable production chains for your DLC setup.',
    icon: '🏭',
    color: '#3b7bbf',
  },
  {
    slug: 'roi-calculator',
    title: 'ROI Calculator',
    description: 'Compare income sources — crops vs animals vs production chains.',
    icon: '📊',
    color: '#c8892a',
  },
  {
    slug: 'best-start',
    title: 'Best Start Generator',
    description: 'Get a personalized starting strategy based on your map, budget, and playstyle.',
    icon: '🚀',
    color: '#6b4226',
  },
]

export default async function ToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>Tools</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          All tools are powered by ground-truth data imported directly from the game XML files.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {TOOLS.map(tool => (
          <a
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{
              display: 'block', padding: '1.5rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '12px', textDecoration: 'none',
              position: 'relative', overflow: 'hidden',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: tool.color }} />
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem', marginTop: '0.25rem' }}>{tool.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>{tool.title}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tool.description}</div>
          </a>
        ))}
      </div>
    </main>
  )
}
