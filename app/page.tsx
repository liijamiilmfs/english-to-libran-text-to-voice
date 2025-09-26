'use client'

import { useEffect } from 'react'
import LoginButton from './components/auth/LoginButton'

export default function Home() {
  console.log('Home page rendering!')
  
  useEffect(() => {
    console.log('Home page useEffect running!')
    
    // Simple redirect to hero page after a delay
    setTimeout(() => {
      console.log('Redirecting to /hero')
      window.location.href = '/hero'
    }, 2000)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
      {/* Login button in top right */}
      <div className="absolute top-4 right-4 z-10">
        <LoginButton showUserInfo={true} />
      </div>
      
      {/* Profile link */}
      <div className="absolute top-4 left-4 z-10">
        <a
          href="/profile"
          className="text-white hover:text-gray-300 font-medium"
        >
          Profile
        </a>
      </div>
      
      {/* Ominous background effects */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      
      {/* Floating particles for atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
            style={{
              left: `${(i * 7 + 13) % 100}%`,
              top: `${(i * 11 + 17) % 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center flex-col text-center px-8">
        {/* Main title with ominous styling */}
        <h1 
          className="text-6xl md:text-8xl font-black mb-6 drop-shadow-2xl tracking-wider"
          style={{ 
            fontFamily: 'Cinzel, serif',
            background: 'linear-gradient(45deg, #ffd700, #ffed4e, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        >
          Librán Voice Forge
        </h1>
        
        {/* Ominous subtitle */}
        <p className="text-2xl md:text-3xl font-bold mb-8 text-stone-200 tracking-wide" style={{ fontFamily: 'Merriweather, serif' }}>
          The Ancient Forge Awakens...
        </p>
        
        {/* Loading animation */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
        
        {/* Ominous description */}
        <div className="text-lg md:text-xl text-stone-300/90 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Merriweather, serif' }}>
          <p className="mb-4">Where Ancient Runes Meet Steam-Powered Magic</p>
          <p className="text-sm text-stone-400 animate-pulse">Preparing the sacred forge...</p>
        </div>

        {/* Runic border effect */}
        <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent"></div>
        <div className="absolute top-8 bottom-8 left-8 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
        <div className="absolute top-8 bottom-8 right-8 w-px bg-gradient-to-b from-transparent via-amber-400/50 to-transparent"></div>
      </div>
    </div>
  )
}