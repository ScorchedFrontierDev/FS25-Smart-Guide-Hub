import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChallengeSubmitClient from './ChallengeSubmitClient'

export default async function SubmitChallengePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: maps } = await supabase.from('maps').select('id, slug, name').order('name')
  const { data: dlcs }  = await supabase.from('dlcs').select('id, slug, name, tier').order('tier')

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/challenges" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Challenges</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.75rem 0 0.4rem' }}>Submit a challenge</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Your challenge will be reviewed before going live. Be specific — the best challenges have clear rules and a satisfying win condition.
      </p>
      <ChallengeSubmitClient maps={maps ?? []} dlcs={dlcs ?? []} userId={user.id} />
    </main>
  )
}
