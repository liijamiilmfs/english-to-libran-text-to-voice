'use client'

import React, { useState, useEffect } from 'react'
import { Search, BookOpen, Loader2 } from 'lucide-react'
import type { Phrase } from '../../lib/types/phrase'

interface PhrasePickerProps {
  onPhraseSelect: (phrase: Phrase, variant: 'ancient' | 'modern') => void
  onLoadingChange: (loading: boolean) => void
}

export default function PhrasePicker({ onPhraseSelect, onLoadingChange }: PhrasePickerProps) {
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const isAncientDisabled = true

  useEffect(() => {
    loadPhrases()
  }, [])

  const loadPhrases = async () => {
    try {
      setLoading(true)
      onLoadingChange(true)
      
      // Mock phrases for now - replace with actual API call
      const mockPhrases: Phrase[] = [
        {
          english: "Hello, how are you?",
          ancient: "Salaam, kama ana huna al-yaum?",
          modern: "Salaam, kama ana huna al-yaum?",
          category: "greetings",
          description: "Common greeting"
        },
        {
          english: "Thank you very much",
          ancient: "Shukran jazeelan",
          modern: "Shukran jazeelan",
          category: "gratitude",
          description: "Expression of gratitude"
        },
        {
          english: "Good morning",
          ancient: "Sabah al-khayr",
          modern: "Sabah al-khayr",
          category: "greetings",
          description: "Morning greeting"
        },
        {
          english: "May peace be with you",
          ancient: "As-salaam alaykum",
          modern: "As-salaam alaykum",
          category: "blessings",
          description: "Traditional blessing"
        },
        {
          english: "Welcome",
          ancient: "Ahlan wa sahlan",
          modern: "Ahlan wa sahlan",
          category: "greetings",
          description: "Welcoming phrase"
        }
      ]
      
      setPhrases(mockPhrases)
    } catch (error) {
      console.error('Failed to load phrases:', error)
    } finally {
      setLoading(false)
      onLoadingChange(false)
    }
  }

  const filteredPhrases = phrases.filter(phrase => {
    const matchesSearch = phrase.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phrase.ancient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phrase.modern.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(phrases.map(p => p.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-libran-gold" />
        <span className="ml-2 text-gray-400">Loading phrases...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search phrases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent text-sm"
        />
      </div>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="w-full px-3 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent text-sm"
      >
        <option value="all">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat} className="capitalize">
            {cat?.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      {/* Phrases List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredPhrases.map((phrase, index) => (
          <div
            key={index}
            className="bg-libran-darker border border-libran-gold/20 rounded-lg p-3 hover:bg-libran-gold/10 transition-colors cursor-pointer"
          >
            <div className="space-y-2">
              <div className="text-sm text-gray-300">{phrase.english}</div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (isAncientDisabled) return
                    onPhraseSelect(phrase, 'ancient')
                  }}
                  disabled={isAncientDisabled}
                  className={`flex-1 px-2 py-1 border rounded text-xs transition-colors ${
                    isAncientDisabled
                      ? 'bg-libran-gold/10 border-libran-gold/20 text-libran-gold/50 cursor-not-allowed'
                      : 'bg-libran-gold/20 border-libran-gold/30 text-libran-gold hover:bg-libran-gold/30'
                  }`}
                >
                  Ancient: {phrase.ancient}
                </button>
                <button
                  onClick={() => onPhraseSelect(phrase, 'modern')}
                  className="flex-1 px-2 py-1 bg-libran-accent/20 border border-libran-accent/30 rounded text-xs text-libran-accent hover:bg-libran-accent/30 transition-colors"
                >
                  Modern: {phrase.modern}
                </button>
              </div>

              {phrase.description && (
                <div className="text-xs text-gray-500">{phrase.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPhrases.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="w-8 h-8 mx-auto text-gray-500 mb-2" />
          <p className="text-sm text-gray-400">No phrases found</p>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {isAncientDisabled && (
        <p className="text-xs text-gray-500">
          Ancient phrase presets are temporarily disabled while we focus on the modern Librán library.
        </p>
      )}
    </div>
  )
}
