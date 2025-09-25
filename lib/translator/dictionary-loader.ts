import * as fs from 'fs'
import path from 'path'
import { watch } from 'fs'

import modernDictionaryFile from './dictionaries/modern.json'

export interface DictionaryEntry {
  [key: string]: string | {
    base?: string
    plural?: string
    possessive?: string
    present?: string
    past?: string
    future?: string
  }
}

export interface Dictionary {
  variant: 'ancient' | 'modern'
  version?: string
  language?: string
  metadata?: {
    description: string
    lastUpdated: string
    wordCount: number
  }
  entries: DictionaryEntry
  phrases?: DictionaryEntry
  rules?: {
    [key: string]: any
  }
}

type RawDictionaryObject = Omit<Dictionary, 'variant'>
type RawDictionaryFile = RawDictionaryObject | DictionaryEntry

const staticDictionaryFiles: Partial<Record<'ancient' | 'modern', RawDictionaryFile>> = {
  modern: modernDictionaryFile as RawDictionaryFile
}

const dictionaryCache = new Map<string, Dictionary>()
let fileWatchers: Map<string, any> = new Map()
let isWatching = false

export async function loadDictionary(variant: 'ancient' | 'modern'): Promise<Dictionary> {
  // Check cache first
  if (dictionaryCache.has(variant)) {
    return dictionaryCache.get(variant)!
  }

  try {
    const dictionary = loadDictionaryFromFileSystem(variant)

    // Cache the dictionary
    dictionaryCache.set(variant, dictionary)

    // Start watching the file for changes (only in development)
    if (process.env.NODE_ENV === 'development' && !isWatching) {
      startFileWatching()
    }

    return dictionary
  } catch (error) {
    const fallbackVariant = resolveFallbackVariant(variant)

    if (!fallbackVariant) {
      throw error
    }

    console.warn(
      `[DictionaryLoader] Falling back to bundled dictionary for ${variant} variant using ${fallbackVariant} data`,
      error instanceof Error ? error.message : error
    )

    try {
      if (fallbackVariant !== variant) {
        const fallbackFromFile = loadDictionaryFromFileSystem(fallbackVariant)
        dictionaryCache.set(variant, fallbackFromFile)
        dictionaryCache.set(fallbackVariant, fallbackFromFile)
        return fallbackFromFile
      }
    } catch (fallbackError) {
      console.warn(
        `[DictionaryLoader] Failed to load fallback dictionary from filesystem for ${fallbackVariant}:`,
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      )
    }

    const fallbackDictionaryFile = staticDictionaryFiles[fallbackVariant]

    if (!fallbackDictionaryFile) {
      throw new Error(`Fallback dictionary not available for variant ${fallbackVariant}`)
    }

    const bundledDictionary = normalizeDictionary(fallbackVariant, fallbackDictionaryFile)
    dictionaryCache.set(variant, bundledDictionary)
    if (fallbackVariant !== variant) {
      dictionaryCache.set(fallbackVariant, bundledDictionary)
    }

    return bundledDictionary
  }
}

export function getDictionaryEntry(
  dictionary: Dictionary,
  word: string
): string | undefined {
  const lowerWord = word.toLowerCase()
  
  // Check phrases first (higher priority)
  if (dictionary.phrases && dictionary.phrases[lowerWord]) {
    const entry = dictionary.phrases[lowerWord]
    return typeof entry === 'string' ? entry : entry.base
  }
  
  // Check regular entries
  if (dictionary.entries[lowerWord]) {
    const entry = dictionary.entries[lowerWord]
    return typeof entry === 'string' ? entry : entry.base
  }
  
  return undefined
}

export function getDictionaryRules(dictionary: Dictionary): Record<string, any> {
  return dictionary.rules || {}
}

// File watching and cache management functions
function startFileWatching() {
  if (isWatching) return

  isWatching = true
  const dictionariesDir = path.join(process.cwd(), 'lib', 'translator', 'dictionaries')

  console.log('[DictionaryLoader] Starting file watching for hot-reload in development mode')
  
  // Watch for changes to dictionary files
  const variants: ('ancient' | 'modern')[] = ['ancient', 'modern']
  
  variants.forEach(variant => {
    setupFileWatcher(variant, dictionariesDir)
  })
}

function loadDictionaryFromFileSystem(variant: 'ancient' | 'modern'): Dictionary {
  const { path: dictionaryPath, resolvedVariant } = resolveDictionaryPath(variant)
  const dictionaryData = fs.readFileSync(dictionaryPath, 'utf-8')
  const rawDictionary = JSON.parse(dictionaryData) as RawDictionaryFile

  return normalizeDictionary(resolvedVariant, rawDictionary)
}

function normalizeDictionary(variant: 'ancient' | 'modern', rawDictionary: RawDictionaryFile): Dictionary {
  if (!rawDictionary || typeof rawDictionary !== 'object') {
    throw new Error(`Invalid dictionary format for ${variant}`)
  }

  if (hasEntriesObject(rawDictionary)) {
    const entries = normalizeEntries(rawDictionary.entries)
    const phrases = rawDictionary.phrases ? normalizeEntries(rawDictionary.phrases) : undefined
    const metadata = normalizeMetadata(variant, rawDictionary.metadata, entries)

    return {
      variant,
      version: rawDictionary.version ?? '1.0.0',
      language: rawDictionary.language ?? `${variant}-libran`,
      metadata,
      entries,
      phrases,
      rules: rawDictionary.rules ?? {}
    }
  }

  const entries = normalizeEntries(rawDictionary as DictionaryEntry)

  return {
    variant,
    version: '1.0.0',
    language: `${variant}-libran`,
    metadata: normalizeMetadata(variant, undefined, entries),
    entries,
    rules: {}
  }
}

function hasEntriesObject(value: RawDictionaryFile): value is RawDictionaryObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    'entries' in value &&
    typeof (value as RawDictionaryObject).entries === 'object'
  )
}

function normalizeMetadata(
  variant: 'ancient' | 'modern',
  metadata: Dictionary['metadata'] | undefined,
  entries: DictionaryEntry
): NonNullable<Dictionary['metadata']> {
  const wordCount = Object.keys(entries).length

  if (metadata) {
    return {
      description: metadata.description ?? `${variant} Librán dictionary`,
      lastUpdated: metadata.lastUpdated ?? new Date().toISOString(),
      wordCount: metadata.wordCount ?? wordCount
    }
  }

  return {
    description: `${variant} Librán dictionary`,
    lastUpdated: new Date().toISOString(),
    wordCount
  }
}

function normalizeEntries(entries: DictionaryEntry): DictionaryEntry {
  return Object.entries(entries).reduce<DictionaryEntry>((acc, [key, value]) => {
    const normalizedKey = key.toLowerCase()
    acc[normalizedKey] = value
    return acc
  }, {})
}

function resolveDictionaryPath(variant: 'ancient' | 'modern'): { path: string, resolvedVariant: 'ancient' | 'modern' } {
  const candidateVariants: Array<'ancient' | 'modern'> = [variant]

  const attemptedPaths: string[] = []

  for (const candidateVariant of candidateVariants) {
    const candidatePaths = [
      path.join(process.cwd(), 'lib', 'translator', 'dictionaries', `${candidateVariant}.json`),
      path.join(__dirname, 'dictionaries', `${candidateVariant}.json`),
      path.join(process.cwd(), '.next', 'server', 'app', 'lib', 'translator', 'dictionaries', `${candidateVariant}.json`)
    ]

    for (const candidatePath of candidatePaths) {
      attemptedPaths.push(candidatePath)
      if (fs.existsSync(candidatePath)) {
        return { path: candidatePath, resolvedVariant: candidateVariant }
      }
    }
  }

  throw new Error(`Dictionary file not found for ${variant}. Checked paths: ${attemptedPaths.join(', ')}`)
}

function resolveFallbackVariant(variant: 'ancient' | 'modern'): 'ancient' | 'modern' | undefined {
  if (variant === 'modern') {
    return 'modern'
  }

  if (variant === 'ancient') {
    return 'modern'
  }

  return undefined
}

function setupFileWatcher(variant: 'ancient' | 'modern', dictionariesDir: string) {
  const filePath = path.join(dictionariesDir, `${variant}.json`)
  
  if (fs.existsSync(filePath)) {
    const watcher = watch(filePath, (eventType, _filename) => {
      if (eventType === 'change') {
        console.log(`[DictionaryLoader] Dictionary file changed: ${variant}.json`)
        invalidateCache(variant)
      } else if (eventType === 'rename') {
        console.log(`[DictionaryLoader] Dictionary file renamed (atomic save): ${variant}.json`)
        invalidateCache(variant)
        
        // Re-attach watcher after rename (atomic save creates new file)
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            console.log(`[DictionaryLoader] Re-attaching watcher for ${variant}.json after rename`)
            // Close old watcher
            const oldWatcher = fileWatchers.get(variant)
            if (oldWatcher) {
              oldWatcher.close()
            }
            // Setup new watcher
            setupFileWatcher(variant, dictionariesDir)
          }
        }, 100) // Small delay to ensure file is fully written
      }
    })
    
    fileWatchers.set(variant, watcher)
    console.log(`[DictionaryLoader] Watching ${filePath}`)
  }
}

function invalidateCache(variant: 'ancient' | 'modern') {
  console.log(`[DictionaryLoader] Invalidating cache for ${variant} dictionary`)
  dictionaryCache.delete(variant)
  
  // Reload the dictionary immediately
  loadDictionary(variant).catch(error => {
    console.error(`[DictionaryLoader] Failed to reload ${variant} dictionary:`, error)
  })
}

export function clearCache() {
  console.log('[DictionaryLoader] Clearing all dictionary caches')
  dictionaryCache.clear()
}

export function reloadDictionary(variant: 'ancient' | 'modern'): Promise<Dictionary> {
  console.log(`[DictionaryLoader] Manually reloading ${variant} dictionary`)
  dictionaryCache.delete(variant)
  return loadDictionary(variant)
}

export function stopWatching() {
  if (!isWatching) return
  
  console.log('[DictionaryLoader] Stopping file watchers')
  fileWatchers.forEach((watcher, variant) => {
    watcher.close()
    console.log(`[DictionaryLoader] Stopped watching ${variant}.json`)
  })
  
  fileWatchers.clear()
  isWatching = false
}










