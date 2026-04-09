import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserSaves } from '@/lib/queries'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [saves, { data: challenges }] = await Promise.all([
    getUserSaves(user.id),
    supabase.from('user_challenge_progress')
      .select('*, challenges(title, category)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(5),
  ])

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dashboard</h1>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user.email}</div>
      </div>

      {/* Active saves */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Active playthroughs</h2>
        {saves.length === 0 ? (
          <div style={{ padding: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No saves yet. <a href="/guides" style={{ color: 'var(--field)', textDecoration: 'none' }}>Start a guide →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {saves.map((save: any) => {
              const progress = save.total_steps > 0 ? Math.round((save.current_step / save.total_steps) * 100) : 0
              return (
                <div key={save.id} style={{ padding: '1rem 1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{save.save_label ?? 'Unnamed save'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Step {save.current_step} of {save.total_steps} · {save.phase ?? 'Phase 1'}
                    </div>
                    <div style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '2px', width: '160px' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--field)', borderRadius: '2px' }} />
                    </div>
                  </div>
                  <a href={`/guides/${save.guide_id}`} style={{ color: 'var(--field)', fontSize: '0.875rem', textDecoration: 'none', flexShrink: 0 }}>Resume →</a>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Active challenges */}
      {(challenges?.length ?? 0) > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Active challenges</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(challenges ?? []).map((cp: any) => (
              <div key={cp.id} style={{ padding: '0.875rem 1.25rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{(cp.challenges as any)?.title}</div>
                <a href={`/challenges/${cp.challenge_id}`} style={{ color: 'var(--field)', fontSize: '0.875rem', textDecoration: 'none' }}>View →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick links */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Quick links</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Guides', href: '/guides' },
            { label: 'Land Analyzer', href: '/tools/land-analyzer' },
            { label: 'Production Planner', href: '/tools/production-planner' },
            { label: 'ROI Calculator', href: '/tools/roi-calculator' },
            { label: 'Best Start', href: '/tools/best-start' },
            { label: 'Challenges', href: '/challenges' },
            { label: 'Co-op Hub', href: '/coop' },
            { label: 'DLC Profile', href: '/settings/dlc' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ padding: '0.875rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', textDecoration: 'none', color: 'var(--text-primary)', textAlign: 'center', fontSize: '0.875rem', fontWeight: 500 }}>
              {link.label}
            </a>
          ))}
        </div>
      </section>

      {/* Admin */}
      <section>
        <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Admin</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Patch review', href: '/admin/patch-review' },
            { label: 'Challenge moderation', href: '/admin/challenges' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{ padding: '0.5rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
