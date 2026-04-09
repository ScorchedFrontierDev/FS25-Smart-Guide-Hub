'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } })
    setSent(true)
    setLoading(false)
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  const handleDiscord = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Sign in</h1>

        {sent ? (
          <p style={{ color: 'var(--text-secondary)' }}>Check your email for a magic link.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '0.75rem 1rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1rem' }}
              />
              <button
                onClick={handleMagicLink}
                disabled={loading || !email}
                style={{ padding: '0.75rem', background: 'var(--field)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={handleGoogle} style={{ padding: '0.75rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Continue with Google
              </button>
              <button onClick={handleDiscord} style={{ padding: '0.75rem', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Continue with Discord
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
