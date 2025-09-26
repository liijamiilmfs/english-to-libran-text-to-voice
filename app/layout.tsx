import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import AuthProvider from './providers/session-provider'

export const metadata: Metadata = {
  title: 'Librán Voice Forge',
  description: 'Transform English text into the ancient language of Librán and bring it to life with AI-powered voice synthesis.',
  keywords: ['translation', 'text-to-speech', 'fictional language', 'Librán', 'AI', 'voice synthesis'],
  authors: [{ name: 'Librán Voice Forge Team' }],
  openGraph: {
    title: 'Librán Voice Forge',
    description: 'Transform English text into the ancient language of Librán and bring it to life with AI-powered voice synthesis.',
    type: 'website',
  },
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Uncial+Antiqua&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Merriweather:wght@300;400;700;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
