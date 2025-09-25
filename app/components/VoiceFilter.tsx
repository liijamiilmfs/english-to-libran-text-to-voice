'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, X, Star, Volume2 } from 'lucide-react'
import { 
  VoiceProfile, 
  type VoiceFilter, 
  filterVoices, 
  getFilterOptions,
  getVoiceRecommendations 
} from '@/lib/voices'

interface VoiceFilterProps {
  onVoiceSelect: (voice: VoiceProfile) => void
  selectedVoice?: VoiceProfile
  text?: string
  variant?: 'ancient' | 'modern'
  className?: string
}

export default function VoiceFilter({ 
  onVoiceSelect, 
  selectedVoice, 
  text = '', 
  variant = 'ancient',
  className = '' 
}: VoiceFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<VoiceFilter>({})
  const [showRecommendations, setShowRecommendations] = useState(false)

  const filterOptions = useMemo(() => getFilterOptions(), [])
  
  const filteredVoices = useMemo(() => {
    const filter: VoiceFilter = {
      ...activeFilters,
      searchQuery: searchQuery.trim() || undefined
    }
    return filterVoices(filter)
  }, [activeFilters, searchQuery])

  const recommendations = useMemo(() => {
    if (!text.trim()) return []
    return getVoiceRecommendations(text, variant)
  }, [text, variant])

  const handleFilterChange = (key: keyof VoiceFilter, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setActiveFilters({})
    setSearchQuery('')
  }

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined
  ) || searchQuery.trim()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Controls */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search voices by name, mood, or characteristics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent"
          />
        </div>

        {/* Filter Toggle and Clear */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white hover:bg-libran-accent/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-libran-gold text-libran-dark text-xs px-2 py-1 rounded-full">
                {Object.values(activeFilters).filter(v => Array.isArray(v) ? v.length > 0 : v !== undefined).length + (searchQuery.trim() ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}

          {text.trim() && (
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center space-x-1 px-3 py-2 bg-libran-gold text-libran-dark rounded-lg hover:bg-libran-gold/80 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>AI Recommendations</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="bg-libran-dark border border-libran-accent rounded-lg p-4 space-y-4">
          {/* Mood Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mood</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => {
                    const currentMoods = activeFilters.mood || []
                    const newMoods = currentMoods.includes(mood)
                      ? currentMoods.filter(m => m !== mood)
                      : [...currentMoods, mood]
                    handleFilterChange('mood', newMoods.length > 0 ? newMoods : undefined)
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    (activeFilters.mood || []).includes(mood)
                      ? 'bg-libran-gold text-libran-dark'
                      : 'bg-libran-accent/20 text-gray-300 hover:bg-libran-accent/40'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Use Case Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Use Case</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.useCases.map(useCase => (
                <button
                  key={useCase}
                  onClick={() => {
                    const currentUseCases = activeFilters.useCases || []
                    const newUseCases = currentUseCases.includes(useCase)
                      ? currentUseCases.filter(u => u !== useCase)
                      : [...currentUseCases, useCase]
                    handleFilterChange('useCases', newUseCases.length > 0 ? newUseCases : undefined)
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    (activeFilters.useCases || []).includes(useCase)
                      ? 'bg-libran-gold text-libran-dark'
                      : 'bg-libran-accent/20 text-gray-300 hover:bg-libran-accent/40'
                  }`}
                >
                  {useCase}
                </button>
              ))}
            </div>
          </div>

          {/* Characteristics Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Characteristics</label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.characteristics.map(char => (
                <button
                  key={char}
                  onClick={() => {
                    const currentChars = activeFilters.characteristics || []
                    const newChars = currentChars.includes(char)
                      ? currentChars.filter(c => c !== char)
                      : [...currentChars, char]
                    handleFilterChange('characteristics', newChars.length > 0 ? newChars : undefined)
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    (activeFilters.characteristics || []).includes(char)
                      ? 'bg-libran-gold text-libran-dark'
                      : 'bg-libran-accent/20 text-gray-300 hover:bg-libran-accent/40'
                  }`}
                >
                  {char}
                </button>
              ))}
            </div>
          </div>

          {/* Librán Suitability Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Librán Suitability: {activeFilters.minLibránSuitability || 1}+
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={activeFilters.minLibránSuitability || 1}
              onChange={(e) => handleFilterChange('minLibránSuitability', parseInt(e.target.value))}
              className="w-full h-2 bg-libran-accent rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Any (1)</span>
              <span>Perfect (10)</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-libran-dark border border-libran-gold/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-libran-gold mb-3 flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>AI Recommendations for your text</span>
          </h4>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((voice, index) => (
              <button
                key={voice.id}
                onClick={() => onVoiceSelect(voice)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedVoice?.id === voice.id
                    ? 'border-libran-gold bg-libran-gold/10'
                    : 'border-libran-accent hover:bg-libran-accent/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-white">{voice.name}</div>
                    <div className="text-sm text-gray-400">{voice.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-libran-gold">#{index + 1}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-libran-gold fill-current" />
                      <span className="text-xs text-gray-400">{voice.libránSuitability}/10</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-300">
            {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''} found
          </h4>
          {filteredVoices.length === 0 && hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-libran-gold hover:underline"
            >
              Clear filters to see all voices
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredVoices.map(voice => (
            <button
              key={voice.id}
              onClick={() => onVoiceSelect(voice)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedVoice?.id === voice.id
                  ? 'border-libran-gold bg-libran-gold/10'
                  : 'border-libran-accent hover:bg-libran-accent/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Volume2 className="w-4 h-4 text-libran-gold" />
                    <span className="font-medium text-white">{voice.name}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-libran-gold fill-current" />
                      <span className="text-xs text-gray-400">{voice.libránSuitability}/10</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{voice.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {voice.characteristics.slice(0, 3).map(char => (
                      <span
                        key={char}
                        className="px-2 py-1 bg-libran-accent/20 text-gray-300 text-xs rounded"
                      >
                        {char}
                      </span>
                    ))}
                    {voice.characteristics.length > 3 && (
                      <span className="px-2 py-1 bg-libran-accent/20 text-gray-300 text-xs rounded">
                        +{voice.characteristics.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Pitch: {voice.pitch}</span>
                    <span>Energy: {voice.energy}</span>
                    <span>Formality: {voice.formality}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
