'use client'

import { useState, useEffect } from 'react'
import { Volume2, Shield, LogOut, Settings } from 'lucide-react'
import { VoiceProfile, VoiceAccent } from '@/lib/voices'
import type { VoiceFilter } from '@/lib/dynamic-voice-filter'
import TranslationForm from '../components/TranslationForm'
import TranslationResult from '../components/TranslationResult'
import AudioDownloadButton from '../components/AudioDownloadButton'
import PhrasePicker from '../components/PhrasePicker'
import IntegratedVoiceSelector from '../components/IntegratedVoiceSelector'
import {
  SIMPLE_VOICE_OPTIONS,
  getSimpleVoiceDefinition,
  SimpleVoiceId,
  getDefaultSimpleVoice
} from '@/lib/simple-voice-system'
import type { Phrase } from '@/lib/types/phrase'

export default function AppPage() {
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            'X-API-Secret': process.env.NEXT_PUBLIC_API_SECRET || 'dev-api-secret-change-in-production'
          }
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // Redirect to hero page if not authenticated
          window.location.href = '/hero'
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        window.location.href = '/hero'
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleTranslation = (translatedText: string, selectedVariant: 'ancient' | 'modern', originalText: string, translationData?: { confidence?: number, wordCount?: number }) => {
    setLibranText(translatedText)
    setVariant(selectedVariant)
    setInputText(originalText)
    if (translationData) {
      setTranslationData(translationData)
    }
  }

  const handleVoiceChange = (voice: VoiceProfile | null, filter: VoiceFilter | null, accent: VoiceAccent | null) => {
    setSelectedVoice(voice)
    setSelectedVoiceFilter(filter)
    setSelectedAccent(accent)
  }

  const handleSimpleVoiceChange = (voiceId: SimpleVoiceId) => {
    setSelectedSimpleVoice(voiceId)
  }

  const handleAudioGenerated = (url: string, blob: Blob, providerInfo: { provider: string, voiceLabel: string, fallback: boolean }) => {
    setAudioUrl(url)
    setAudioBlob(blob)
    setTtsProviderInfo(providerInfo)
  }

  const handlePhraseSelect = (phrase: Phrase) => {
    setInputText(phrase.english)
  }

  const handleLogout = () => {
    // Clear any stored auth data
    localStorage.removeItem('auth_token')
    // Redirect to hero page
    window.location.href = '/hero'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-orange-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-amber-200">Verifying access to the Forge...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-orange-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-amber-400" />
              <h1 className="text-xl font-bold text-amber-400">Librán Voice Forge</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Voice Settings</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Translation Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-amber-500/20">
              <h2 className="text-2xl font-bold text-amber-400 mb-6">Text Translation</h2>
              <TranslationForm
                onTranslation={handleTranslation}
                onLoadingChange={setIsTranslating}
              />
            </div>

            {/* Translation Result */}
            {libranText && (
              <div className="mt-6">
                <TranslationResult
                  libranText={libranText}
                  variant={variant}
                  originalText={inputText}
                  confidence={translationData.confidence}
                  wordCount={translationData.wordCount}
                />
              </div>
            )}

            {/* Audio Player */}
            {audioBlob && (
              <div className="mt-6">
                <AudioDownloadButton
                  audioBlob={audioBlob}
                  variant={variant}
                  content={libranText}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Selector */}
            {showVoiceSelector && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-amber-500/20">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">Voice Settings</h3>
                <IntegratedVoiceSelector
                  selectedVoice={selectedVoice}
                  selectedVoiceFilter={selectedVoiceFilter}
                  selectedAccent={selectedAccent}
                  onVoiceSelect={(voice) => handleVoiceChange(voice, selectedVoiceFilter, selectedAccent)}
                  onVoiceFilterSelect={(filter) => handleVoiceChange(selectedVoice, filter, selectedAccent)}
                  onAccentChange={(accent) => handleVoiceChange(selectedVoice, selectedVoiceFilter, accent)}
                />
              </div>
            )}

            {/* Phrase Picker */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Common Phrases</h3>
              <PhrasePicker 
                onPhraseSelect={(phrase, variant) => {
                  setInputText(phrase.english)
                  setVariant(variant)
                }}
                onLoadingChange={() => {}}
              />
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">Forge Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-200">Authentication:</span>
                  <span className="text-green-400">✓ Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">Translation Engine:</span>
                  <span className="text-green-400">✓ Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">Voice Synthesis:</span>
                  <span className="text-green-400">✓ Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
