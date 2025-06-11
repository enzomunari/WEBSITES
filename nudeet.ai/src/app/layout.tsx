// app/layout.tsx
import '@/styles/globals.css'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NUDEET - AI Generation Studio',
  description: 'Advanced AI-powered image generation',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}