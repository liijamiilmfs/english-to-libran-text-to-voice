'use client'

import { trackError, trackTranslation, trackVoiceGeneration } from '@/lib/analytics'
import type { VoiceFilter } from '@/lib/dynamic-voice-filter'
import {
  SIMPLE_VOICE_OPTIONS,
  SimpleVoiceId,
  getDefaultSimpleVoice,
  getSimpleVoiceDefinition
} from '@/lib/simple-voice-system'
import type { Phrase } from '@/lib/types/phrase'
import { VoiceAccent, VoiceProfile } from '@/lib/voices'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import AudioDownloadButton from '../components/AudioDownloadButton'
import IntegratedVoiceSelector from '../components/IntegratedVoiceSelector'
import PhrasePicker from '../components/PhrasePicker'
import TranslationForm from '../components/TranslationForm'
import TranslationResult from '../components/TranslationResult'

// Helper function to convert voice characteristics to TTS parameters
function characteristicsToTTSParams(characteristics: any) {
  return {
    voice: characteristics.voiceId || 'default',
    speed: characteristics.speed || 1.0,
    pitch: characteristics.pitch || 0
  }
}

export default function AppPage() {
  const router = useRouter()

  const [inputText, setInputText] = useState('')
  const [variant, setVariant] = useState<'ancient' | 'modern'>('ancient')
  const [libranText, setLibranText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile | null>(null)
  const [selectedVoiceFilter, setSelectedVoiceFilter] = useState<VoiceFilter | null>(null)
  const [selectedAccent, setSelectedAccent] = useState<VoiceAccent | null>(null)
  const [selectedSimpleVoice, setSelectedSimpleVoice] = useState<SimpleVoiceId | null>(getDefaultSimpleVoice())
  const [audioUrl, setAudioUrl] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [translationData, setTranslationData] = useState<{
    confidence?: number
    wordCount?: number
  }>({})
  const [showVoiceSelector, setShowVoiceSelector] = useState(false)
  const [ttsProviderInfo, setTtsProviderInfo] = useState<{
    provider: string
    voiceLabel: string
    fallback: boolean
  } | null>(null)

  // Authentication is handled by middleware, so we can assume user is authenticated

  const handleTranslation = (translatedText: string, selectedVariant: 'ancient' | 'modern', originalText: string, translationData?: { confidence?: number, wordCount?: number }) => {
    setLibranText(translatedText)
    setVariant(selectedVariant)
    setInputText(originalText)
    if (translationData) {
      setTranslationData(translationData)
    }

    // Track successful translation
    trackTranslation(originalText.length, 'translation_api', true)
  }

  const handleVoiceChange = useCallback((voice: VoiceProfile | null, filter: VoiceFilter | null, accent: VoiceAccent | null) => {
    setSelectedVoice(voice)
    setSelectedVoiceFilter(filter)
    setSelectedAccent(accent)
    setSelectedSimpleVoice(null) // Reset simple voice when advanced voice is selected
  }, [])

  const handleSimpleVoiceChange = useCallback((voiceId: SimpleVoiceId) => {
    setSelectedSimpleVoice(voiceId)
    setSelectedVoice(null) // Reset advanced voice when simple voice is selected
    setSelectedVoiceFilter(null)
    setSelectedAccent(null)
  }, [])

  const handlePhraseSelect = (phrase: Phrase, selectedVariant: 'ancient' | 'modern') => {
    const phraseText = selectedVariant === 'ancient' ? phrase.ancient : phrase.modern
    setLibranText(phraseText)
    setInputText(phrase.english)
    setVariant(selectedVariant)
    setTranslationData({
      confidence: 1.0, // Phrases are pre-translated, so 100% confidence
      wordCount: phrase.english.split(' ').length
    })
  }

  const handleVoiceSelect = (voice: VoiceProfile | null) => {
    setSelectedSimpleVoice(null)
    setSelectedVoice(voice)
    setShowVoiceSelector(false)
  }

  const handleVoiceFilterSelect = (filter: VoiceFilter | null) => {
    setSelectedSimpleVoice(null)
    setSelectedVoiceFilter(filter)
    setShowVoiceSelector(false)
  }

  const handleAccentChange = (accent: VoiceAccent | null) => {
    setSelectedAccent(accent)
  }

  const handleSimpleVoiceSelect = (voiceId: SimpleVoiceId) => {
    setSelectedSimpleVoice(voiceId)
    setSelectedVoice(null)
    setSelectedVoiceFilter(null)
    setSelectedAccent(null)
  }

  const handleGenerateAudio = async () => {
    if (!libranText) return

    const startTime = Date.now()
    setIsGenerating(true)
    setAudioUrl('')
    setAudioBlob(null)
    setTtsProviderInfo(null)

    try {
      let response: Response

      if (selectedSimpleVoice) {
        const simpleVoiceDefinition = getSimpleVoiceDefinition(selectedSimpleVoice)
        if (!simpleVoiceDefinition) {
          throw new Error('Invalid voice selection')
        }

        const requestData = {
          libranText,
          voice: simpleVoiceDefinition.id,
          format: 'mp3'
        }

        console.log('=== SENDING CLEAN TTS REQUEST ===')
        console.log('Selected simple voice:', simpleVoiceDefinition.label)
        console.log('Request data:', requestData)

        response = await fetch('/api/speak-clean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
      } else {
        const requestData = {
          libranText,
          voice: selectedVoice?.id || 'alloy',
          format: 'mp3',
          accent: selectedAccent,
          voiceFilter: selectedVoiceFilter ? {
            characteristics: selectedVoiceFilter.characteristics,
            prompt: selectedVoiceFilter.prompt
          } : undefined
        }

        console.log('=== SENDING ADVANCED TTS REQUEST ===')
        console.log('Selected voice:', selectedVoice?.name || 'none')
        console.log('Selected voice filter:', selectedVoiceFilter?.name || 'none')
        console.log('Selected accent:', selectedAccent || 'none')
        console.log('Request data:', requestData)

        response = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate audio')
      }

      // The API returns a binary audio stream, not JSON
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      setAudioBlob(audioBlob)

      // Extract metadata from response headers
      const provider = response.headers.get('X-TTS-Provider') || 'openai'
      const voiceLabel = response.headers.get('X-Voice-Label') || selectedVoice?.name || 'unknown'
      const fallback = response.headers.get('X-Fallback-Used') === 'true'

      setTtsProviderInfo({ provider, voiceLabel, fallback })

      // Track successful voice generation
      const duration = Date.now() - startTime
      const voiceId = selectedSimpleVoice || selectedVoice?.id || 'unknown'
      trackVoiceGeneration(voiceId, provider, duration, true)

    } catch (error) {
      console.error('Error generating audio:', error)
      alert(`Failed to generate audio: ${(error as Error).message}`)

      // Track failed voice generation
      const duration = Date.now() - startTime
      const voiceId = selectedSimpleVoice || selectedVoice?.id || 'unknown'
      trackVoiceGeneration(voiceId, 'unknown', duration, false)
      trackError('voice_generation_failed', error instanceof Error ? error.message : 'Unknown error', {
        voice_id: voiceId,
        text_length: libranText.length
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Missing helper functions
  const clearVoiceSelection = () => {
    setSelectedSimpleVoice(null)
    setSelectedVoice(null)
    setSelectedVoiceFilter(null)
    setSelectedAccent(null)
  }

  const simpleVoiceDefinition = selectedSimpleVoice ? getSimpleVoiceDefinition(selectedSimpleVoice) : null
  const hasAdvancedVoice = !!selectedVoice || !!selectedVoiceFilter
  const hasAnyVoiceSelected = !!simpleVoiceDefinition || hasAdvancedVoice

  const formatAccentLabel = (accent?: string | null) => {
    if (!accent) return null
    const normalized = accent.replace(/-/g, ' ')
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const activeVoiceName = simpleVoiceDefinition?.label || selectedVoice?.name || selectedVoiceFilter?.name || ''
  const activeVoiceDescription = simpleVoiceDefinition?.description || selectedVoice?.description || selectedVoiceFilter?.prompt || ''
  const activeAccentLabel = simpleVoiceDefinition
    ? formatAccentLabel(simpleVoiceDefinition.accent)
    : formatAccentLabel(selectedAccent)
  const activeProvider = simpleVoiceDefinition ? 'ElevenLabs' : hasAdvancedVoice ? 'OpenAI' : null

  // Authentication is handled by middleware, so we can proceed directly

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <header className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-libran-red to-libran-gold bg-clip-text text-transparent"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Librán Voice Forge
          </motion.h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Transform English text into the ancient language of Librán and bring it to life with AI-powered voice synthesis.
          </p>
        </header>

        {/* Main Workflow */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Translation Input */}
          <div className="xl:col-span-1">
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6 h-full">
              <h2 className="text-xl font-semibold mb-4 text-libran-gold">
                English to Librán Translation
              </h2>

              <TranslationForm
                onTranslation={handleTranslation}
                onLoadingChange={setIsTranslating}
              />
            </div>
          </div>

          {/* Center Column - Translation Result & Audio */}
          <div className="xl:col-span-1">
            <div className="space-y-6">
              {/* Translation Result */}
              <TranslationResult
                libranText={libranText}
                variant={variant}
                originalText={inputText}
                confidence={translationData.confidence}
                wordCount={translationData.wordCount}
              />

              {/* Audio Controls */}
              <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 text-libran-gold">
                  Audio Output
                </h3>

                {/* Voice Selection */}
                <div className="mb-4 space-y-4">
                  <div className="bg-libran-darker border border-libran-gold/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-libran-gold uppercase tracking-wide">
                        Quick ElevenLabs Voices
                      </h4>
                      {selectedSimpleVoice && (
                        <button
                          onClick={() => setSelectedSimpleVoice(null)}
                          className="text-xs text-libran-gold hover:underline"
                        >
                          Disable
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Premium accent voices powered by ElevenLabs. We automatically fall back to OpenAI if there&apos;s an error.
                    </p>
                    <div className="space-y-2">
                      {SIMPLE_VOICE_OPTIONS.map(voice => (
                        <label
                          key={voice.id}
                          className={`flex items-start gap-3 rounded-md border p-3 transition-colors ${selectedSimpleVoice === voice.id
                            ? 'border-libran-gold bg-libran-gold/10'
                            : 'border-transparent hover:border-libran-gold/40'
                            }`}
                        >
                          <input
                            type="radio"
                            name="simple-voice"
                            value={voice.id}
                            checked={selectedSimpleVoice === voice.id}
                            onChange={() => handleSimpleVoiceSelect(voice.id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-sm font-medium text-white">{voice.label}</div>
                            <div className="text-xs text-gray-400">{voice.description}</div>
                            <div className="text-xs text-libran-gold/80 mt-1 capitalize">
                              Provider: {voice.provider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'} · Accent: {formatAccentLabel(voice.accent)}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Advanced Voice Designer (OpenAI)
                      </label>
                      <button
                        onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                        className="text-sm text-libran-gold hover:underline"
                      >
                        {showVoiceSelector ? 'Hide Designer' : 'Open Designer'}
                      </button>
                    </div>

                    {!hasAnyVoiceSelected ? (
                      <div className="p-4 bg-libran-dark border border-libran-accent rounded-lg text-center text-gray-400">
                        <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm">No voice selected</p>
                        <p className="text-xs mt-1">Pick a quick ElevenLabs voice above or design a custom OpenAI voice.</p>
                      </div>
                    ) : (
                      <div className={`p-3 rounded-lg ${simpleVoiceDefinition
                        ? 'bg-libran-gold/10 border border-libran-gold/30'
                        : 'bg-libran-accent/10 border border-libran-accent/30'
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{activeVoiceName}</div>
                            {activeVoiceDescription && (
                              <div className="text-sm text-gray-400">{activeVoiceDescription}</div>
                            )}
                            <div className="text-xs text-libran-gold/80 mt-1 capitalize">
                              Provider: {activeProvider}
                              {activeAccentLabel && (
                                <> · Accent: {activeAccentLabel}</>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={clearVoiceSelection}
                            className="text-gray-400 hover:text-white"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Integrated Voice Selector */}
                {showVoiceSelector && (
                  <div className="mb-4">
                    <IntegratedVoiceSelector
                      onVoiceSelect={handleVoiceSelect}
                      onVoiceFilterSelect={handleVoiceFilterSelect}
                      onAccentChange={handleAccentChange}
                      selectedVoice={selectedVoice}
                      selectedVoiceFilter={selectedVoiceFilter}
                      selectedAccent={selectedAccent}
                    />
                  </div>
                )}

                {/* Speak Button */}
                <button
                  onClick={handleGenerateAudio}
                  disabled={!libranText.trim() || isGenerating || (!selectedSimpleVoice && !selectedVoice && !selectedVoiceFilter)}
                  className="btn-primary w-full mb-4"
                >
                  {isGenerating
                    ? 'Generating...'
                    : (!selectedSimpleVoice && !selectedVoice && !selectedVoiceFilter)
                      ? 'Select Voice First'
                      : 'Speak'}
                </button>

                {/* Audio Player */}
                {audioUrl && (
                  <div className="space-y-3">
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                    />

                    {/* Audio Download Button */}
                    <AudioDownloadButton
                      audioBlob={audioBlob}
                      variant={variant}
                      content={libranText}
                      size="sm"
                      className="w-full"
                    />

                    {ttsProviderInfo && (
                      <div className="text-xs text-gray-400 bg-libran-darker border border-libran-gold/20 rounded-md p-3">
                        Generated with <span className="text-white font-medium">{ttsProviderInfo.provider === 'elevenlabs' ? 'ElevenLabs' : 'OpenAI'}</span>
                        {' '}voice <span className="text-white font-medium">{ttsProviderInfo.voiceLabel}</span>
                        {ttsProviderInfo.fallback && (
                          <span className="ml-1 text-libran-gold">(OpenAI fallback activated)</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Phrase Picker */}
          <div className="xl:col-span-1">
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6 h-full">
              <h3 className="text-lg font-semibold mb-4 text-libran-gold">
                Phrase Library
              </h3>
              <PhrasePicker
                onPhraseSelect={handlePhraseSelect}
                onLoadingChange={setIsTranslating}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6 text-libran-gold">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold mb-2 text-libran-gold">
                Deterministic Translation
              </h3>
              <p className="text-gray-300 text-sm">
                Rule-based English-to-Librán translation using comprehensive dictionaries
              </p>
            </div>
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold mb-2 text-libran-gold">
                AI Voice Synthesis
              </h3>
              <p className="text-gray-300 text-sm">
                OpenAI TTS integration with customizable voice parameters
              </p>
            </div>
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold mb-2 text-libran-gold">
                Phrase Integration
              </h3>
              <p className="text-gray-300 text-sm">
                Browse and use authentic Librán phrases with English translations
              </p>
            </div>
            <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold mb-2 text-libran-gold">
                Copy & Download
              </h3>
              <p className="text-gray-300 text-sm">
                Copy translations to clipboard and download with smart filename templates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}