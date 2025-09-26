import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { log, generateCorrelationId, LogEvents } from '@/lib/logger'
import { ErrorCode, createErrorResponse } from '@/lib/error-taxonomy'

// Dictionary file paths
const DICTIONARY_PATHS = {
  ancient: path.join(process.cwd(), 'data/dictionaries/current/UnifiedLibranDictionaryv1.6.3.json'),
  modern: path.join(process.cwd(), 'data/dictionaries/current/UnifiedLibranDictionaryv1.6.3.json')
}

interface DictionaryEntry {
  english: string
  ancient?: string
  modern?: string
  notes?: string
  category?: string
  section?: string
}

interface DictionarySection {
  data: DictionaryEntry[]
}

interface DictionaryData {
  metadata: any
  sections: Record<string, DictionarySection>
}

/**
 * Load dictionary data from file
 */
async function loadDictionaryData(variant: 'ancient' | 'modern'): Promise<DictionaryData> {
  try {
    const filePath = DICTIONARY_PATHS[variant]
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to load dictionary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Save dictionary data to file
 */
async function saveDictionaryData(variant: 'ancient' | 'modern', data: DictionaryData): Promise<void> {
  try {
    const filePath = DICTIONARY_PATHS[variant]
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    throw new Error(`Failed to save dictionary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Move entries between sections and update their category/section properties
 * This fixes the issue where entries were only updated in-place but not moved between sections
 */
async function moveEntriesToCategory(
  dictionaryData: DictionaryData, 
  entries: string[], 
  targetCategory: string
): Promise<boolean> {
  let modified = false
  const entriesToMove: { entry: DictionaryEntry, sourceSection: string }[] = []

  // First pass: find all entries to move and remove them from their current sections
  if (dictionaryData.sections) {
    Object.entries(dictionaryData.sections).forEach(([sectionName, section]) => {
      if (section.data && Array.isArray(section.data)) {
        // Process in reverse order to avoid index issues when removing items
        for (let i = section.data.length - 1; i >= 0; i--) {
          const entry = section.data[i]
          if (entries.includes(entry.english)) {
            // Update the entry properties
            entry.category = targetCategory
            entry.section = targetCategory
            
            // Store for moving to target section
            entriesToMove.push({ entry, sourceSection: sectionName })
            
            // Remove from current section
            section.data.splice(i, 1)
            modified = true
          }
        }
      }
    })
  }

  // Second pass: add entries to target section
  if (entriesToMove.length > 0) {
    // Ensure target section exists
    if (!dictionaryData.sections) {
      dictionaryData.sections = {}
    }
    
    if (!dictionaryData.sections[targetCategory]) {
      dictionaryData.sections[targetCategory] = { data: [] }
    }
    
    // Add all moved entries to target section
    entriesToMove.forEach(({ entry }) => {
      dictionaryData.sections[targetCategory].data.push(entry)
    })
    
    log.info(`Moved ${entriesToMove.length} entries to category '${targetCategory}'`, {
      event: LogEvents.DICTIONARY_BULK_EDIT,
      ctx: { 
        targetCategory, 
        entriesMoved: entriesToMove.length,
        entryNames: entriesToMove.map(({ entry }) => entry.english)
      }
    })
  }

  return modified
}

/**
 * Update entry properties without moving between sections
 */
async function updateEntryProperties(
  dictionaryData: DictionaryData,
  entries: string[],
  updates: Partial<DictionaryEntry>
): Promise<boolean> {
  let modified = false

  if (dictionaryData.sections) {
    Object.values(dictionaryData.sections).forEach((section: DictionarySection) => {
      if (section.data && Array.isArray(section.data)) {
        section.data.forEach((entry: DictionaryEntry) => {
          if (entries.includes(entry.english)) {
            // Apply updates to entry
            Object.assign(entry, updates)
            modified = true
          }
        })
      }
    })
  }

  return modified
}

/**
 * Handle bulk dictionary operations
 */
export async function POST(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('POST', '/api/admin/dictionary/bulk', requestId)

  try {
    const body = await request.json()
    const { operation, variant = 'ancient', entries, category, updates } = body

    // Validation
    if (!operation || !['addCategory', 'updateProperties'].includes(operation)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_OPERATION, { requestId })
      log.validationFail('operation', 'Operation must be "addCategory" or "updateProperties"', requestId)
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    if (!variant || !['ancient', 'modern'].includes(variant)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_VARIANT, { requestId, variant })
      log.validationFail('variant', 'Variant must be "ancient" or "modern"', requestId, { variant })
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_ENTRIES, { requestId })
      log.validationFail('entries', 'Entries array is required and must not be empty', requestId)
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Load dictionary data
    const dictionaryData = await loadDictionaryData(variant as 'ancient' | 'modern')

    let modified = false

    if (operation === 'addCategory') {
      if (!category || typeof category !== 'string') {
        const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_CATEGORY, { requestId })
        log.validationFail('category', 'Category is required for addCategory operation', requestId)
        return NextResponse.json(errorResponse.body, { status: errorResponse.status })
      }

      // Move entries to target category (this fixes the original issue)
      modified = await moveEntriesToCategory(dictionaryData, entries, category)
      
      log.info('Bulk category operation completed', {
        event: LogEvents.DICTIONARY_BULK_EDIT,
        corr_id: requestId,
        ctx: { 
          operation, 
          variant, 
          targetCategory: category, 
          entriesCount: entries.length,
          modified 
        }
      })

    } else if (operation === 'updateProperties') {
      if (!updates || typeof updates !== 'object') {
        const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_UPDATES, { requestId })
        log.validationFail('updates', 'Updates object is required for updateProperties operation', requestId)
        return NextResponse.json(errorResponse.body, { status: errorResponse.status })
      }

      modified = await updateEntryProperties(dictionaryData, entries, updates)
      
      log.info('Bulk property update completed', {
        event: LogEvents.DICTIONARY_BULK_EDIT,
        corr_id: requestId,
        ctx: { 
          operation, 
          variant, 
          updates, 
          entriesCount: entries.length,
          modified 
        }
      })
    }

    // Save changes if any modifications were made
    if (modified) {
      await saveDictionaryData(variant as 'ancient' | 'modern', dictionaryData)
      
      return NextResponse.json({
        success: true,
        modified,
        message: `Successfully updated ${entries.length} entries`,
        operation,
        variant,
        entriesCount: entries.length
      })
    } else {
      return NextResponse.json({
        success: false,
        modified,
        message: 'No entries were found or modified',
        operation,
        variant,
        entriesCount: entries.length
      })
    }

  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCode.DICTIONARY_BULK_OPERATION_FAILED, { requestId }, error as Error)
    log.errorWithContext(error instanceof Error ? error : new Error('Unknown error'), LogEvents.DICTIONARY_BULK_EDIT_ERROR, requestId)
    
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  }
}

/**
 * Get bulk operation status or available operations
 */
export async function GET(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('GET', '/api/admin/dictionary/bulk', requestId)

  try {
    const url = new URL(request.url)
    const variant = url.searchParams.get('variant') || 'ancient'

    if (!['ancient', 'modern'].includes(variant)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_VARIANT, { requestId, variant })
      log.validationFail('variant', 'Variant must be "ancient" or "modern"', requestId, { variant })
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Load dictionary data to get statistics
    const dictionaryData = await loadDictionaryData(variant as 'ancient' | 'modern')
    
    const stats = {
      totalSections: Object.keys(dictionaryData.sections || {}).length,
      totalEntries: Object.values(dictionaryData.sections || {}).reduce(
        (total, section) => total + (section.data?.length || 0), 0
      ),
      sections: Object.keys(dictionaryData.sections || {})
    }

    return NextResponse.json({
      success: true,
      variant,
      stats,
      availableOperations: ['addCategory', 'updateProperties']
    })

  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCode.DICTIONARY_LOAD_FAILED, { requestId }, error as Error)
    log.errorWithContext(error instanceof Error ? error : new Error('Unknown error'), LogEvents.DICTIONARY_LOAD_ERROR, requestId)
    
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  }
}
