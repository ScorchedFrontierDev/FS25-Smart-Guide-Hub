import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DLCProfileClient from './DLCProfileClient'

export default async function DLCProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch all DLCs and user's current selections
  const [{ data: dlcs }, { data: profile }] = await Promise.all([
    supabase.from('dlcs').select('*').order('tier').order('price'),
    supabase.from('user_dlc_profile').select('dlc_id, is_owned').eq('user_id', user.id),
  ])

  const ownedIds = new Set(
    (profile ?? []).filter(r => r.is_owned).map(r => r.dlc_id)
  )

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem' }}>
      <a href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Dashboard</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Your DLC profile</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Toggle the DLCs you own. Every guide, tool, and challenge on the site adapts to this selection.
      </p>
      <DLCProfileClient
        dlcs={dlcs ?? []}
        ownedIds={[...ownedIds]}
        userId={user.id}
      />
    </main>
  )
}
