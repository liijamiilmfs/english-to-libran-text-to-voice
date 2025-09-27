import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import AuthProvider from './providers/session-provider'
import { Cinzel, Crimson_Text, Merriweather } from 'next/font/google'

const cinzel = Cinzel({ 
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900']
})

const crimsonText = Crimson_Text({ 
  subsets: ['latin'],
  variable: '--font-crimson-text',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic']
})

const merriweather = Merriweather({ 
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900']
})

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
    <html lang="en" className={`${cinzel.variable} ${crimsonText.variable} ${merriweather.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
