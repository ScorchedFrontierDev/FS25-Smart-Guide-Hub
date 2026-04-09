'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { buildDLCContext, type DLCContext } from '@/lib/dlc'

export function useDLCContext(userId: string | null) {
  const [ctx, setCtx] = useState<DLCContext | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchContext = useCallback(async () => {
    if (!userId) {
      setCtx(buildDLCContext([]))
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('user_dlc_profile')
      .select('is_owned, dlcs(slug)')
      .eq('user_id', userId)
      .eq('is_owned', true)

    const ownedSlugs = (data ?? [])
      .map(row => (row.dlcs as { slug: string } | null)?.slug)
      .filter(Boolean) as string[]

    setCtx(buildDLCContext(ownedSlugs))
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchContext() }, [fetchContext])

  const toggleDLC = async (dlcId: string, owned: boolean) => {
    if (!userId) return
    const supabase = createClient()
    await supabase
      .from('user_dlc_profile')
      .upsert({ user_id: userId, dlc_id: dlcId, is_owned: owned })
    fetchContext()
  }

  return { ctx, loading, toggleDLC, refresh: fetchContext }
}
