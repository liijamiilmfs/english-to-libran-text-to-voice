'use client'

import React, { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

interface TranslationResultProps {
  libranText: string
  variant: 'ancient' | 'modern'
  originalText: string
  confidence?: number
  wordCount?: number
  isTranslating?: boolean
}

export default function TranslationResult({ 
  libranText, 
  variant, 
  originalText, 
  confidence, 
  wordCount,
  isTranslating = false
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(libranText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  if (!libranText && !isTranslating) {
    return (
      <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6 text-center">
        <div className="text-gray-400">
          <p className="text-sm">Translation will appear here</p>
          <p className="text-xs mt-1">Enter English text and click Translate</p>
        </div>
      </div>
    )
  }

  if (isTranslating && !libranText) {
    return (
      <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center space-x-2 text-libran-gold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Translating...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-libran-dark border border-libran-gold/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-libran-gold">
          {variant === 'ancient' ? 'Ancient Librán' : 'Modern Librán'}
        </h3>
        <button
          onClick={handleCopy}
          disabled={isTranslating}
          className={`flex items-center space-x-1 px-3 py-1 border rounded text-sm transition-colors ${
            isTranslating
              ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
              : 'bg-libran-accent/20 border-libran-accent text-white hover:bg-libran-accent/40'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-libran-darker border border-libran-gold/20 rounded-lg p-4">
          <div className="text-white text-lg leading-relaxed">
            {libranText}
          </div>
        </div>

        {originalText && (
          <div className="text-sm text-gray-400">
            <span className="font-medium">Original:</span> {originalText}
          </div>
        )}

        {(confidence !== undefined || wordCount !== undefined) && (
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {confidence !== undefined && (
              <span>Confidence: {(confidence * 100).toFixed(1)}%</span>
            )}
            {wordCount !== undefined && (
              <span>Words: {wordCount}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
