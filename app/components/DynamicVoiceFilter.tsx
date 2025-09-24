'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Save, Trash2, Play, Volume2, Star, Settings } from 'lucide-react'
import { 
  VoiceFilter, 
  VoiceCharacteristics, 
  createVoiceFilter, 
  saveVoiceFilter, 
  getSavedVoiceFilters, 
  deleteVoiceFilter, 
  updateFilterUsage,
  describeVoiceCharacteristics,
  characteristicsToTTSParams
} from '@/lib/dynamic-voice-filter'

interface DynamicVoiceFilterProps {
  onVoiceFilterSelect: (filter: VoiceFilter) => void
  selectedFilter?: VoiceFilter
  className?: string
}

export default function DynamicVoiceFilter({ 
  onVoiceFilterSelect, 
  selectedFilter,
  className = '' 
}: DynamicVoiceFilterProps) {
  const [prompt, setPrompt] = useState('')
  const [filterName, setFilterName] = useState('')
  const [savedFilters, setSavedFilters] = useState<VoiceFilter[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)

  // Load saved filters on mount
  useEffect(() => {
    setSavedFilters(getSavedVoiceFilters())
  }, [])

  // Generate characteristics from current prompt
  const currentCharacteristics = useMemo(() => {
    if (!prompt.trim()) return null
    return createVoiceFilter(prompt).characteristics
  }, [prompt])

  const handleCreateFilter = () => {
    if (!prompt.trim()) return

    const filter = createVoiceFilter(prompt, filterName || undefined)
    saveVoiceFilter(filter)
    setSavedFilters(getSavedVoiceFilters())
    onVoiceFilterSelect(filter)
    setPrompt('')
    setFilterName('')
  }

  const handleSelectFilter = (filter: VoiceFilter) => {
    updateFilterUsage(filter.id)
    onVoiceFilterSelect(filter)
    setSavedFilters(getSavedVoiceFilters()) // Refresh to update usage stats
  }

  const handleDeleteFilter = (filterId: string) => {
    deleteVoiceFilter(filterId)
    setSavedFilters(getSavedVoiceFilters())
    if (selectedFilter?.id === filterId) {
      onVoiceFilterSelect(createVoiceFilter('', 'Default Voice'))
    }
  }

  const handlePreview = async () => {
    if (!currentCharacteristics) return

    setIsGeneratingPreview(true)
    try {
      // Generate a sample Librán text for preview
      const sampleText = "Salaam dunya, kama ana huna al-yaum"
      
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libranText: sampleText,
          voice: 'alloy', // Use base voice
          format: 'mp3',
          voiceFilter: characteristicsToTTSParams(currentCharacteristics)
        })
      })

      if (!response.ok) throw new Error('Preview failed')

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      
      audio.onended = () => {
        setShowPreview(false)
        URL.revokeObjectURL(url)
      }
      
      audio.play()
      setShowPreview(true)
    } catch (error) {
      console.error('Preview error:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Create New Filter */}
      <div className="bg-libran-dark border border-libran-gold/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-libran-gold flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Voice Filter</span>
        </h3>
        
        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Describe the voice you want:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'deep, mysterious, ancient voice with ceremonial authority' or 'warm, friendly storyteller with gentle energy'"
              className="w-full h-20 px-3 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent resize-none"
            />
          </div>

          {/* Filter Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter Name (optional):
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="e.g., 'Mystical Ancient Voice'"
              className="w-full px-3 py-2 bg-libran-dark border border-libran-accent rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-libran-gold focus:border-transparent"
            />
          </div>

          {/* Generated Characteristics Preview */}
          {currentCharacteristics && (
            <div className="bg-libran-accent/10 border border-libran-accent/30 rounded-lg p-3">
              <h4 className="text-sm font-medium text-libran-gold mb-2">Generated Characteristics:</h4>
              <p className="text-sm text-gray-300 mb-3">
                {describeVoiceCharacteristics(currentCharacteristics)}
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Pitch: {currentCharacteristics.pitch.toFixed(1)}</div>
                <div>Speed: {currentCharacteristics.speed.toFixed(1)}</div>
                <div>Volume: {currentCharacteristics.volume.toFixed(1)}</div>
                <div>Warmth: {currentCharacteristics.warmth.toFixed(1)}</div>
                <div>Authority: {currentCharacteristics.authority.toFixed(1)}</div>
                <div>Mystery: {currentCharacteristics.mystery.toFixed(1)}</div>
                <div>Formality: {currentCharacteristics.formality.toFixed(1)}</div>
                <div>Ancientness: {currentCharacteristics.ancientness.toFixed(1)}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateFilter}
              disabled={!prompt.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-libran-gold text-libran-dark rounded-lg hover:bg-libran-gold/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Create Filter</span>
            </button>

            {currentCharacteristics && (
              <button
                onClick={handlePreview}
                disabled={isGeneratingPreview}
                className="flex items-center space-x-2 px-4 py-2 bg-libran-accent/20 border border-libran-accent rounded-lg text-white hover:bg-libran-accent/40 transition-colors disabled:opacity-50"
              >
                {isGeneratingPreview ? (
                  <div className="w-4 h-4 border-2 border-libran-gold border-t-transparent rounded-full animate-spin" />
                ) : showPreview ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>{isGeneratingPreview ? 'Generating...' : showPreview ? 'Playing...' : 'Preview'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="bg-libran-dark border border-libran-gold/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-libran-gold flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Saved Voice Filters</span>
          </h3>
          
          <div className="space-y-3">
            {savedFilters.map(filter => (
              <div
                key={filter.id}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedFilter?.id === filter.id
                    ? 'border-libran-gold bg-libran-gold/10'
                    : 'border-libran-accent hover:bg-libran-accent/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-white">{filter.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-libran-gold fill-current" />
                        <span className="text-xs text-gray-400">{filter.useCount}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2">{filter.prompt}</p>
                    
                    <p className="text-xs text-gray-500">
                      {describeVoiceCharacteristics(filter.characteristics)}
                    </p>
                    
                    <div className="text-xs text-gray-600 mt-1">
                      Created: {filter.createdAt.toLocaleDateString()}
                      {filter.lastUsed && ` • Last used: ${filter.lastUsed.toLocaleDateString()}`}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleSelectFilter(filter)}
                      className="px-3 py-1 bg-libran-gold text-libran-dark rounded text-sm hover:bg-libran-gold/80 transition-colors"
                    >
                      Use
                    </button>
                    
                    <button
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Filter Display */}
      {selectedFilter && (
        <div className="bg-libran-gold/10 border border-libran-gold/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-libran-gold mb-2">Active Voice Filter:</h4>
          <div className="text-white font-medium">{selectedFilter.name}</div>
          <div className="text-sm text-gray-300">{selectedFilter.prompt}</div>
        </div>
      )}
    </div>
  )
}
