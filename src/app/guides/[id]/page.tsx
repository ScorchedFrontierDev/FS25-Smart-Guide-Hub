import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import GuideReader from './GuideReader'

export default async function GuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the guide
  const { data: guide, error } = await supabase
    .from('guides')
    .select('*, maps(slug, name)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !guide) notFound()

  // Fetch existing save for this guide if user is logged in
  let existingSave = null
  if (user) {
    const { data: save } = await supabase
      .from('user_saves')
      .select('*')
      .eq('user_id', user.id)
      .eq('guide_id', guide.id)
      .single()
    existingSave = save
  }

  return (
    <GuideReader
      guide={guide}
      existingSave={existingSave}
      userId={user?.id ?? null}
    />
  )
}
