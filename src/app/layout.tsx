import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'FS25 Smart Guide Hub', template: '%s · FS25 Hub' },
  description: 'Personalized Farming Simulator 25 guides, tools, and challenges — powered by ground-truth game data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  )
}
