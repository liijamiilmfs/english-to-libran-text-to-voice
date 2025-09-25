'use client'

import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface TranslationFormProps {
  onTranslation: (
    translatedText: string,
    variant: 'ancient' | 'modern',
    originalText: string,
    translationData?: { confidence?: number, wordCount?: number, requestedVariant?: 'ancient' | 'modern' }
  ) => void
  onLoadingChange: (loading: boolean) => void
}

export default function TranslationForm({ onTranslation, onLoadingChange }: TranslationFormProps) {
  const [inputText, setInputText] = useState('')
  const [variant, setVariant] = useState<'ancient' | 'modern'>('modern')
  const [isLoading, setIsLoading] = useState(false)
  const isAncientDisabled = true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setIsLoading(true)
    onLoadingChange(true)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, variant })
      })

      if (!response.ok) throw new Error('Translation failed')
      
      const data = await response.json()
      const effectiveVariant = (data.variant ?? variant) as 'ancient' | 'modern'
      setVariant(effectiveVariant)
      onTranslation(data.libran, effectiveVariant, inputText, {
        confidence: data.confidence,
        wordCount: data.wordCount,
        requestedVariant: (data.requestedVariant ?? variant) as 'ancient' | 'modern'
      })
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again.')
    } finally {
      setIsLoading(false)
      onLoadingChange(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          English Text
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter English text to translate..."
          className="w-full px-3 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent resize-none"
          rows={4}
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Translation Variant
        </label>
        <div className="flex space-x-4">
          <label className={`flex items-center ${isAncientDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              value="ancient"
              checked={variant === 'ancient'}
              onChange={(e) => {
                if (isAncientDisabled) return
                setVariant(e.target.value as 'ancient' | 'modern')
              }}
              className="mr-2 text-libran-gold focus:ring-libran-gold"
              disabled={isLoading || isAncientDisabled}
            />
            <span className="text-sm text-gray-300">Ancient Librán (coming soon)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="modern"
              checked={variant === 'modern'}
              onChange={(e) => setVariant(e.target.value as 'ancient' | 'modern')}
              className="mr-2 text-libran-gold focus:ring-libran-gold"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-300">Modern Librán</span>
          </label>
        </div>
      </div>

      {isAncientDisabled && (
        <p className="text-xs text-gray-500">
          Ancient Librán is temporarily unavailable while we stabilise the modern dictionary.
        </p>
      )}

      <button
        type="submit"
        disabled={!inputText.trim() || isLoading}
        className="w-full flex items-center justify-center px-4 py-2 bg-libran-gold text-libran-dark rounded-lg font-medium hover:bg-libran-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Translating...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Translate
          </>
        )}
      </button>
    </form>
  )
}
