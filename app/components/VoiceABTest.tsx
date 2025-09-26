'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, RotateCcw, Shuffle, CheckCircle } from 'lucide-react'
import { VoiceProfile } from '@/lib/voices'
import { VoiceFilter } from '@/lib/dynamic-voice-filter'
import VoicePreview from './VoicePreview'

interface VoiceABTestProps {
  voices: (VoiceProfile | VoiceFilter)[]
  accent?: string | null
  sampleText?: string
  className?: string
  onVoiceSelect?: (voice: VoiceProfile | VoiceFilter) => void
}

interface TestResult {
  voice: VoiceProfile | VoiceFilter
  selected: boolean
  timestamp: Date
}

export default function VoiceABTest({ 
  voices, 
  accent, 
  sampleText = "Salaam dunya, kama ana huna al-yaum",
  className = '',
  onVoiceSelect
}: VoiceABTestProps) {
  const [currentTest, setCurrentTest] = useState<{
    voiceA: VoiceProfile | VoiceFilter | null
    voiceB: VoiceProfile | VoiceFilter | null
  }>({ voiceA: null, voiceB: null })
  
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile | VoiceFilter | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Initialize with first two voices if available
  useEffect(() => {
    if (voices.length >= 2 && !currentTest.voiceA && !currentTest.voiceB) {
      setCurrentTest({
        voiceA: voices[0],
        voiceB: voices[1]
      })
    }
  }, [voices, currentTest.voiceA, currentTest.voiceB])

  const startNewTest = () => {
    if (voices.length < 2) return

    // Get two random voices that haven't been tested together recently
    const availableVoices = voices.filter(v => 
      v !== currentTest.voiceA && v !== currentTest.voiceB
    )
    
    let voiceA: VoiceProfile | VoiceFilter
    let voiceB: VoiceProfile | VoiceFilter

    if (availableVoices.length >= 2) {
      voiceA = availableVoices[Math.floor(Math.random() * availableVoices.length)]
      const remainingVoices = availableVoices.filter(v => v !== voiceA)
      voiceB = remainingVoices[Math.floor(Math.random() * remainingVoices.length)]
    } else {
      // Fallback to any two different voices
      const shuffled = [...voices].sort(() => Math.random() - 0.5)
      voiceA = shuffled[0]
      voiceB = shuffled[1] || shuffled[0]
    }

    setCurrentTest({ voiceA, voiceB })
    setSelectedVoice(null)
    setIsRunning(true)
  }

  const selectVoice = (voice: VoiceProfile | VoiceFilter) => {
    if (!currentTest.voiceA || !currentTest.voiceB) return

    const result: TestResult = {
      voice,
      selected: true,
      timestamp: new Date()
    }

    setTestResults(prev => [...prev, result])
    setSelectedVoice(voice)
    setIsRunning(false)

    if (onVoiceSelect) {
      onVoiceSelect(voice)
    }
  }

  const resetTest = () => {
    setCurrentTest({ voiceA: null, voiceB: null })
    setSelectedVoice(null)
    setIsRunning(false)
  }

  const getVoiceName = (voice: VoiceProfile | VoiceFilter) => {
    if ('description' in voice) {
      // It's a VoiceProfile
      return voice.name
    } else {
      // It's a VoiceFilter
      return voice.name
    }
  }

  const getVoiceDescription = (voice: VoiceProfile | VoiceFilter) => {
    if ('description' in voice) {
      return voice.description
    }
    return voice.prompt
  }

  const getTestStats = () => {
    const totalTests = testResults.length
    const voiceStats = voices.reduce((acc, voice) => {
      const wins = testResults.filter(r => r.voice === voice).length
      acc[getVoiceName(voice)] = { wins, percentage: totalTests > 0 ? (wins / totalTests) * 100 : 0 }
      return acc
    }, {} as Record<string, { wins: number; percentage: number }>)

    return { totalTests, voiceStats }
  }

  const stats = getTestStats()

  if (voices.length < 2) {
    return (
      <div className={`bg-libran-darker p-4 rounded-lg border border-libran-blue ${className}`}>
        <h4 className="text-sm font-semibold text-libran-gold mb-2">A/B Voice Test</h4>
        <p className="text-xs text-gray-400">
          Need at least 2 voices to run A/B tests
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="bg-libran-darker p-4 rounded-lg border border-libran-blue">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-libran-gold flex items-center">
            <Shuffle className="w-4 h-4 mr-2" />
            Voice A/B Test
          </h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={startNewTest}
              disabled={voices.length < 2}
              className="btn-primary text-xs px-3 py-1 flex items-center space-x-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>New Test</span>
            </button>
            <button
              onClick={resetTest}
              className="btn-secondary text-xs px-3 py-1 flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-400 mb-2">
          <strong>Sample:</strong> &ldquo;{sampleText}&rdquo;
        </div>

        {stats.totalTests > 0 && (
          <div className="text-xs text-gray-300">
            <strong>Tests completed:</strong> {stats.totalTests}
          </div>
        )}
      </div>

      {/* Current Test */}
      {currentTest.voiceA && currentTest.voiceB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice A */}
          <div className="relative">
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-libran-blue text-white text-xs px-2 py-1 rounded font-bold">
                A
              </span>
            </div>
            <VoicePreview
              voice={'description' in currentTest.voiceA ? currentTest.voiceA as VoiceProfile : undefined}
              voiceFilter={'description' in currentTest.voiceA ? undefined : currentTest.voiceA as VoiceFilter}
              accent={accent}
              sampleText={sampleText}
              className="h-full"
            />
            {isRunning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  onClick={() => selectVoice(currentTest.voiceA!)}
                  className="btn-primary flex items-center space-x-2 px-4 py-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Choose Voice A</span>
                </button>
              </div>
            )}
          </div>

          {/* Voice B */}
          <div className="relative">
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-libran-gold text-black text-xs px-2 py-1 rounded font-bold">
                B
              </span>
            </div>
            <VoicePreview
              voice={'description' in currentTest.voiceB ? currentTest.voiceB as VoiceProfile : undefined}
              voiceFilter={'description' in currentTest.voiceB ? undefined : currentTest.voiceB as VoiceFilter}
              accent={accent}
              sampleText={sampleText}
              className="h-full"
            />
            {isRunning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <button
                  onClick={() => selectVoice(currentTest.voiceB!)}
                  className="btn-primary flex items-center space-x-2 px-4 py-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Choose Voice B</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Results */}
      {stats.totalTests > 0 && (
        <div className="bg-libran-darker p-4 rounded-lg border border-libran-blue">
          <h5 className="text-sm font-semibold text-libran-gold mb-3">Test Results</h5>
          <div className="space-y-2">
            {Object.entries(stats.voiceStats).map(([name, data]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-libran-accent">{data.wins} wins</span>
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-libran-gold h-2 rounded-full transition-all duration-300"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-400 w-8 text-right">
                    {data.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Voice */}
      {selectedVoice && (
        <div className="bg-libran-blue/20 p-4 rounded-lg border border-libran-gold">
          <h5 className="text-sm font-semibold text-libran-gold mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Selected Voice
          </h5>
          <div className="text-sm text-white">
            <strong>{getVoiceName(selectedVoice)}</strong>
            <p className="text-xs text-gray-300 mt-1">
              {getVoiceDescription(selectedVoice)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
