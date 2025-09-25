// Voice settings persistence and management
// Handles saving/loading voice preferences and A/B test results

import { VoiceProfile } from './voices'
import { VoiceFilter } from './dynamic-voice-filter'

export interface VoiceSettings {
  lastUsedVoice?: VoiceProfile | null
  lastUsedVoiceFilter?: VoiceFilter | null
  lastUsedAccent?: string | null
  lastUsedSimpleVoice?: string | null
  preferredSampleText?: string
  abTestResults?: ABTestResult[]
  voicePreferences?: VoicePreference[]
}

export interface ABTestResult {
  id: string
  voiceA: string
  voiceB: string
  selectedVoice: string
  timestamp: Date
  sampleText: string
}

export interface VoicePreference {
  voiceId: string
  voiceType: 'preset' | 'filter' | 'simple'
  score: number // 1-10 rating
  lastUsed: Date
  useCount: number
  notes?: string
}

const STORAGE_KEY = 'libranVoiceSettings'
const DEFAULT_SAMPLE_TEXT = "Salaam dunya, kama ana huna al-yaum"

export function loadVoiceSettings(): VoiceSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultSettings()
    
    const parsed = JSON.parse(stored)
    
    // Convert date strings back to Date objects
    if (parsed.abTestResults) {
      parsed.abTestResults = parsed.abTestResults.map((result: any) => ({
        ...result,
        timestamp: new Date(result.timestamp)
      }))
    }
    
    if (parsed.voicePreferences) {
      parsed.voicePreferences = parsed.voicePreferences.map((pref: any) => ({
        ...pref,
        lastUsed: new Date(pref.lastUsed)
      }))
    }
    
    return { ...getDefaultSettings(), ...parsed }
  } catch (error) {
    console.error('Failed to load voice settings:', error)
    return getDefaultSettings()
  }
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save voice settings:', error)
  }
}

export function getDefaultSettings(): VoiceSettings {
  return {
    lastUsedVoice: null,
    lastUsedVoiceFilter: null,
    lastUsedAccent: null,
    lastUsedSimpleVoice: null,
    preferredSampleText: DEFAULT_SAMPLE_TEXT,
    abTestResults: [],
    voicePreferences: []
  }
}

export function updateLastUsedVoice(
  voice?: VoiceProfile | null,
  voiceFilter?: VoiceFilter | null,
  accent?: string | null,
  simpleVoice?: string | null
): void {
  const settings = loadVoiceSettings()
  
  settings.lastUsedVoice = voice || null
  settings.lastUsedVoiceFilter = voiceFilter || null
  settings.lastUsedAccent = accent || null
  settings.lastUsedSimpleVoice = simpleVoice || null
  
  saveVoiceSettings(settings)
}

export function addABTestResult(
  voiceA: string,
  voiceB: string,
  selectedVoice: string,
  sampleText: string
): void {
  const settings = loadVoiceSettings()
  
  const result: ABTestResult = {
    id: `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    voiceA,
    voiceB,
    selectedVoice,
    timestamp: new Date(),
    sampleText
  }
  
  settings.abTestResults = [...(settings.abTestResults || []), result]
  
  // Keep only last 50 results to prevent storage bloat
  if (settings.abTestResults.length > 50) {
    settings.abTestResults = settings.abTestResults.slice(-50)
  }
  
  saveVoiceSettings(settings)
}

export function updateVoicePreference(
  voiceId: string,
  voiceType: 'preset' | 'filter' | 'simple',
  score: number,
  notes?: string
): void {
  const settings = loadVoiceSettings()
  
  if (!settings.voicePreferences) {
    settings.voicePreferences = []
  }
  
  const existingIndex = settings.voicePreferences.findIndex(
    pref => pref.voiceId === voiceId && pref.voiceType === voiceType
  )
  
  const preference: VoicePreference = {
    voiceId,
    voiceType,
    score: Math.max(1, Math.min(10, score)), // Clamp to 1-10
    lastUsed: new Date(),
    useCount: existingIndex >= 0 ? settings.voicePreferences[existingIndex].useCount + 1 : 1,
    notes
  }
  
  if (existingIndex >= 0) {
    settings.voicePreferences[existingIndex] = preference
  } else {
    settings.voicePreferences.push(preference)
  }
  
  saveVoiceSettings(settings)
}

export function getVoicePreference(
  voiceId: string,
  voiceType: 'preset' | 'filter' | 'simple'
): VoicePreference | null {
  const settings = loadVoiceSettings()
  
  if (!settings.voicePreferences) return null
  
  return settings.voicePreferences.find(
    pref => pref.voiceId === voiceId && pref.voiceType === voiceType
  ) || null
}

export function getTopRatedVoices(limit: number = 5): VoicePreference[] {
  const settings = loadVoiceSettings()
  
  if (!settings.voicePreferences) return []
  
  return settings.voicePreferences
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function getRecentlyUsedVoices(limit: number = 5): VoicePreference[] {
  const settings = loadVoiceSettings()
  
  if (!settings.voicePreferences) return []
  
  return settings.voicePreferences
    .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    .slice(0, limit)
}

export function getABTestStats(): {
  totalTests: number
  voiceWins: Record<string, number>
  mostTestedPairs: Array<{ pair: string; count: number }>
} {
  const settings = loadVoiceSettings()
  
  if (!settings.abTestResults || settings.abTestResults.length === 0) {
    return {
      totalTests: 0,
      voiceWins: {},
      mostTestedPairs: []
    }
  }
  
  const voiceWins: Record<string, number> = {}
  const pairCounts: Record<string, number> = {}
  
  settings.abTestResults.forEach(result => {
    // Count wins
    voiceWins[result.selectedVoice] = (voiceWins[result.selectedVoice] || 0) + 1
    
    // Count pair combinations
    const pair = [result.voiceA, result.voiceB].sort().join(' vs ')
    pairCounts[pair] = (pairCounts[pair] || 0) + 1
  })
  
  const mostTestedPairs = Object.entries(pairCounts)
    .map(([pair, count]) => ({ pair, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
  
  return {
    totalTests: settings.abTestResults.length,
    voiceWins,
    mostTestedPairs
  }
}

export function clearVoiceSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear voice settings:', error)
  }
}

export function exportVoiceSettings(): string {
  const settings = loadVoiceSettings()
  return JSON.stringify(settings, null, 2)
}

export function importVoiceSettings(jsonData: string): boolean {
  try {
    const parsed = JSON.parse(jsonData)
    
    // Validate the structure
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid settings format')
    }
    
    // Convert date strings back to Date objects
    if (parsed.abTestResults && Array.isArray(parsed.abTestResults)) {
      parsed.abTestResults = parsed.abTestResults.map((result: any) => ({
        ...result,
        timestamp: new Date(result.timestamp)
      }))
    }
    
    if (parsed.voicePreferences && Array.isArray(parsed.voicePreferences)) {
      parsed.voicePreferences = parsed.voicePreferences.map((pref: any) => ({
        ...pref,
        lastUsed: new Date(pref.lastUsed)
      }))
    }
    
    saveVoiceSettings(parsed)
    return true
  } catch (error) {
    console.error('Failed to import voice settings:', error)
    return false
  }
}
