import { createClient } from '@/lib/supabase/server'

const ROLES = [
  {
    name: 'The Worker',
    icon: '⛏️',
    focus: 'Early grind, forestry, fishing, contracts',
    color: '#6b4226',
    tasks: ['Run contracts to build startup capital', 'Handle forestry and wood chipping', 'Take on fishing contracts (if Highlands Fishing owned)', 'Operate equipment for larger operations'],
    equipment: ['Chainsaw', 'Forwarder', 'Log trailer', 'Fishing gear'],
    tip: 'The Worker generates cash flow. Prioritize high-payout contracts and avoid time-wasting travel.',
  },
  {
    name: 'The Manager',
    icon: '📋',
    focus: 'Economy decisions, land purchases, production oversight',
    color: '#3b7bbf',
    tasks: ['Make all major purchase decisions', 'Monitor production chain efficiency', 'Handle crop selling timing', 'Plan land expansion'],
    equipment: ['Tractor + seeder', 'Fertilizer spreader', 'Any production placeables'],
    tip: 'The Manager should never be operating equipment — if you are on a tractor, the farm is being mismanaged.',
  },
  {
    name: 'The Logistician',
    icon: '🚛',
    focus: 'Transport, delivery routes, equipment sharing',
    color: '#4a7c3f',
    tasks: ['Haul grain and produce to sell points', 'Manage equipment access via Contractor system', 'Optimize delivery routes', 'Keep silos and storage topped up'],
    equipment: ['Truck + grain trailer', 'Telehandler', 'Pallet forks'],
    tip: 'Map the fastest routes to each sell point on day one. The Logistician role pays dividends every harvest.',
  },
]

export default async function CoopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>Co-op Hub</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
        Role-based strategies for 2–4 player sessions. Assign roles before you start — overlap kills efficiency.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {ROLES.map(role => (
          <div key={role.name} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ height: '4px', background: role.color }} />
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{role.icon}</div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{role.name}</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{role.focus}</p>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Tasks</div>
                {role.tasks.map(t => (
                  <div key={t} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '0.2rem 0', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: role.color, flexShrink: 0 }}>→</span>{t}
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Core equipment</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {role.equipment.map(e => (
                    <span key={e} style={{ fontSize: '0.72rem', padding: '2px 8px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-secondary)' }}>{e}</span>
                  ))}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: `${role.color}12`, border: `1px solid ${role.color}30`, borderRadius: '7px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                💡 {role.tip}
              </div>
            </div>
          </div>
        ))}
      </div>

      <section style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Contractor access rules</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          FS25 co-op uses the Contractor system for equipment sharing. Any player can use another player's equipment if Contractor Access is enabled on that vehicle. The owner pays for fuel and repairs.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            'Set Contractor Access to "All Players" on shared equipment at session start',
            'Logistician should own all transport vehicles — easier to manage access',
            'Worker equipment stays Worker-owned to avoid contract billing confusion',
            'Manager controls all production placeables — ownership matters for upgrade decisions',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: 'var(--field)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>{tip}
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Dedicated server tips</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          Running a dedicated server keeps production chains and aquaculture (Kinlaig) running 24/7 without a host player online. This is essential for time-sensitive production buildings like the dairy and biogas plant, which lose output when the game is paused.
        </p>
      </section>
    </main>
  )
}
