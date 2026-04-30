import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tech Futures Play Book',
  description: 'The Hoover Institution\'s Tech Futures Lab',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
