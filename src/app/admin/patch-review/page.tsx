import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PatchReviewClient from './PatchReviewClient'

export default async function PatchReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pending } = await supabase
    .from('patch_import_log')
    .select('*')
    .eq('status', 'pending')
    .order('flagged_at', { ascending: false })

  const { data: recent } = await supabase
    .from('patch_import_log')
    .select('*')
    .neq('status', 'pending')
    .order('flagged_at', { ascending: false })
    .limit(20)

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <a href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>← Dashboard</a>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0.5rem 0 0.4rem' }}>Patch review</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Review XML import changes before they go live. Approve to write to the database, reject to discard.
      </p>
      <PatchReviewClient pending={pending ?? []} recent={recent ?? []} userId={user.id} />
    </main>
  )
}
