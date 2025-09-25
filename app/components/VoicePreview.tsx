'use client'

import { useState } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { VoiceProfile } from '@/lib/voices'

interface VoicePreviewProps {
  voice: VoiceProfile
  className?: string
}

export default function VoicePreview({ voice, className = '' }: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handlePreview = async () => {
    if (isPlaying) return

    setIsLoading(true)
    try {
      // Use a sample Librán text for preview
      const sampleText = "Salaam dunya, kama ana huna al-yaum"
      
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libranText: sampleText,
          voice: voice.id,
          format: 'mp3'
        })
      })

      if (!response.ok) throw new Error('Preview failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
      }
      
      audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Preview error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePreview}
      disabled={isLoading}
      className={`flex items-center space-x-2 px-3 py-2 bg-libran-accent/20 border border-libran-accent rounded-lg hover:bg-libran-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-libran-gold border-t-transparent rounded-full animate-spin" />
      ) : isPlaying ? (
        <Pause className="w-4 h-4 text-libran-gold" />
      ) : (
        <Play className="w-4 h-4 text-libran-gold" />
      )}
      <span className="text-sm text-white">
        {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Preview'}
      </span>
    </button>
  )
}
