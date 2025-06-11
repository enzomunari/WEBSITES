import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://deeplab-ai.com'),
  title: 'Deeplab-ai - Professional AI Avatar Generator',
  description: 'Create stunning professional AI-generated avatars and portraits for business, LinkedIn, social media, and more. Advanced AI technology for high-quality digital portraits.',
  keywords: 'professional avatar generator, AI portraits, business headshots, LinkedIn photos, professional photos, AI avatars, digital portraits',
  authors: [{ name: 'Deeplab-ai Team' }],
  creator: 'Deeplab-ai',
  publisher: 'Deeplab-ai',
  openGraph: {
    title: 'Deeplab-ai - Professional AI Avatar Generator',
    description: 'Create stunning professional AI-generated avatars and portraits',
    url: 'https://deeplab-ai.com',
    siteName: 'Deeplab-ai',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Deeplab-ai Professional Avatar Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deeplab-ai - Professional AI Avatar Generator',
    description: 'Create stunning professional AI-generated avatars and portraits',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={`${jakarta.className} bg-white text-gray-900 min-h-screen antialiased`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}