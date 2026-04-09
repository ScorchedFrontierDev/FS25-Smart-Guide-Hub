'use client'

import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/',           label: 'Maps'       },
  { href: '/guides',     label: 'Guides'     },
  { href: '/tools',      label: 'Tools'      },
  { href: '/challenges', label: 'Challenges' },
  { href: '/coop',       label: 'Co-op'      },
]

export default function Nav() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15, 26, 14, 0.94)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      display: 'flex', alignItems: 'center',
      height: '56px', gap: '0',
    }}>
      <a href="/" style={{ fontWeight: 700, color: 'var(--field)', textDecoration: 'none', fontSize: '1rem', marginRight: '1.5rem', flexShrink: 0 }}>
        FS25 Hub
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', flex: 1, overflowX: 'auto' }}>
        {NAV_LINKS.map(link => {
          const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
          return (
            <a key={link.href} href={link.href} style={{
              padding: '0.4rem 0.75rem', borderRadius: '6px', textDecoration: 'none',
              fontSize: '0.875rem', whiteSpace: 'nowrap',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: active ? 'var(--surface-3)' : 'transparent',
              fontWeight: active ? 600 : 400,
              transition: 'color 0.15s, background 0.15s',
            }}>
              {link.label}
            </a>
          )
        })}
      </div>

      {!loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {user ? (
            <>
              <a href="/settings/dlc" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>DLC</a>
              <a href="/dashboard" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Dashboard</a>
              <button onClick={signOut} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Sign out
              </button>
            </>
          ) : (
            <a href="/auth/login" style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem', background: 'var(--field)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </a>
          )}
        </div>
      )}
    </nav>
  )
}
