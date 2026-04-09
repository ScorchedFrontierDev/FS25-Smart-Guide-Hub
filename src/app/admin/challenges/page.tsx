import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminChallengesClient from './AdminChallengesClient'

export default async function AdminChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pending } = await supabase
    .from('challenges')
    .select('*, maps(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Dashboard</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>Challenge moderation</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Review and approve community challenge submissions.</p>
      <AdminChallengesClient challenges={pending ?? []} userId={user.id} />
    </main>
  )
}
