'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react'
import { VoiceProfile } from '@/lib/voices'
import { VoiceFilter } from '@/lib/dynamic-voice-filter'

interface VoicePreviewProps {
  voice?: VoiceProfile | null
  voiceFilter?: VoiceFilter | null
  accent?: string | null
  sampleText?: string
  className?: string
}

export default function VoicePreview({ 
  voice, 
  voiceFilter, 
  accent, 
  sampleText = "Salaam dunya, kama ana huna al-yaum",
  className = ''
}: VoicePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio URL when component unmounts or voice changes
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  // Cleanup when voice/filter changes
  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      setIsPlaying(false)
    }
  }, [voice?.id, voiceFilter?.id, accent, audioUrl])

  const handlePreview = async () => {
    if (!sampleText.trim()) return

    setIsGenerating(true)
    setError(null)
    setIsPlaying(false)

    // Clean up previous audio
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    try {
      const requestBody: any = {
        libranText: sampleText,
        voice: 'alloy', // Base voice
        format: 'mp3'
      }

      // Add voice filter if present
      if (voiceFilter) {
        requestBody.voiceFilter = {
          characteristics: voiceFilter.characteristics,
          prompt: voiceFilter.prompt
        }
        requestBody.voice = 'filtered'
      } else if (voice) {
        requestBody.voice = voice.id
        if (accent) {
          requestBody.accent = accent
        }
      }

      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Preview generation failed')
      }

      const audioBlob = await response.blob()
      const newAudioUrl = URL.createObjectURL(audioBlob)
      setAudioUrl(newAudioUrl)

      // Auto-play the preview
      const audio = new Audio(newAudioUrl)
      audioRef.current = audio
      
      audio.onplay = () => setIsPlaying(true)
      audio.onpause = () => setIsPlaying(false)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setError('Failed to play audio preview')
        setIsPlaying(false)
      }

      await audio.play()
    } catch (error) {
      console.error('Voice preview error:', error)
      setError(error instanceof Error ? error.message : 'Preview generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const getVoiceDisplayName = () => {
    if (voiceFilter) {
      return voiceFilter.name
    }
    if (voice) {
      return voice.name
    }
    return 'Default Voice'
  }

  const getVoiceDescription = () => {
    if (voiceFilter) {
      return voiceFilter.prompt
    }
    if (voice) {
      return voice.description
    }
    return 'A standard voice for Librán text'
  }

  return (
    <div className={`bg-libran-darker p-4 rounded-lg border border-libran-blue ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-libran-gold flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Voice Preview
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            {getVoiceDisplayName()}
            {accent && ` (${accent} accent)`}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreview}
            disabled={isGenerating || !sampleText.trim()}
            className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
          >
            {isGenerating ? (
              <>
                <div className="w-3 h-3 border border-libran-gold border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Preview</span>
              </>
            )}
          </button>
          
          {audioUrl && (
            <>
              <button
                onClick={handlePlayPause}
                className="btn-primary text-xs px-3 py-1 flex items-center space-x-1"
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <button
                onClick={handleStop}
                className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-300 mb-2">
        <strong>Sample:</strong> &ldquo;{sampleText}&rdquo;
      </div>

      <div className="text-xs text-gray-400">
        <strong>Description:</strong> {getVoiceDescription()}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
          Error: {error}
        </div>
      )}

      {audioUrl && (
        <div className="mt-3">
          <audio
            ref={audioRef}
            src={audioUrl}
            className="w-full"
            controls
            preload="none"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  )
}