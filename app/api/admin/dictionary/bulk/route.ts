import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { log, generateCorrelationId, LogEvents } from '@/lib/logger'
import { ErrorCode, createErrorResponse } from '@/lib/error-taxonomy'
import { withAdminAuth } from '@/lib/api-security'

interface BulkOperationRequest {
  operation: string
  entries: string[]
  data?: any
  variant?: 'ancient' | 'modern'
}

interface DictionaryEntry {
  english: string
  ancient?: string
  modern?: string
  notes?: string
  category?: string
  section?: string
  tags?: string[]
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
async function loadDictionaryData(variant: 'ancient' | 'modern' = 'ancient'): Promise<DictionaryData> {
  try {
    // Use the v1.7.0 dictionary as it's the most current
    const dictionaryPath = join(process.cwd(), 'data', 'UnifiedLibranDictionaryv1.7.0.json')
    const content = readFileSync(dictionaryPath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to load dictionary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Save dictionary data to file
 */
async function saveDictionaryData(data: DictionaryData): Promise<void> {
  try {
    const dictionaryPath = join(process.cwd(), 'data', 'UnifiedLibranDictionaryv1.7.0.json')
    
    // Create backup before saving
    const backupPath = dictionaryPath.replace('.json', `.backup.${Date.now()}.json`)
    writeFileSync(backupPath, JSON.stringify(data, null, 2))
    
    // Update metadata
    data.metadata.last_modified = new Date().toISOString()
    
    // Save updated dictionary
    writeFileSync(dictionaryPath, JSON.stringify(data, null, 2))
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
 * Add tags to entries
 */
async function addTagsToEntries(dictionaryData: DictionaryData, entries: string[], tags: string[]): Promise<boolean> {
  let modified = false

  if (dictionaryData.sections) {
    Object.values(dictionaryData.sections).forEach((section: DictionarySection) => {
      if (section.data && Array.isArray(section.data)) {
        section.data.forEach((entry: DictionaryEntry) => {
          if (entries.includes(entry.english)) {
            if (!entry.tags) entry.tags = []
            const existingTags = entry.tags || []
            const combinedTags = [...existingTags, ...tags]
            entry.tags = Array.from(new Set(combinedTags)) // Remove duplicates
            modified = true
          }
        })
      }
    })
  }

  return modified
}

/**
 * Update notes for entries
 */
async function updateNotesForEntries(dictionaryData: DictionaryData, entries: string[], notes: string): Promise<boolean> {
  let modified = false

  if (dictionaryData.sections) {
    Object.values(dictionaryData.sections).forEach((section: DictionarySection) => {
      if (section.data && Array.isArray(section.data)) {
        section.data.forEach((entry: DictionaryEntry) => {
          if (entries.includes(entry.english)) {
            entry.notes = notes
            modified = true
          }
        })
      }
    })
  }

  return modified
}

/**
 * Delete entries from dictionary
 */
async function deleteEntries(dictionaryData: DictionaryData, entries: string[]): Promise<boolean> {
  let modified = false

  if (dictionaryData.sections) {
    Object.keys(dictionaryData.sections).forEach(sectionName => {
      const section = dictionaryData.sections[sectionName]
      if (section.data && Array.isArray(section.data)) {
        const originalLength = section.data.length
        section.data = section.data.filter((entry: DictionaryEntry) => !entries.includes(entry.english))
        if (section.data.length !== originalLength) {
          modified = true
        }
      }
    })
  }

  return modified
}

/**
 * Export selected entries
 */
async function exportEntries(dictionaryData: DictionaryData, entries: string[]): Promise<NextResponse> {
  const exportedEntries: DictionaryEntry[] = []

  if (dictionaryData.sections) {
    Object.values(dictionaryData.sections).forEach((section: DictionarySection) => {
      if (section.data && Array.isArray(section.data)) {
        section.data.forEach((entry: DictionaryEntry) => {
          if (entries.includes(entry.english)) {
            exportedEntries.push(entry)
          }
        })
      }
    })
  }

  const exportData = {
    metadata: {
      export_date: new Date().toISOString(),
      exported_entries: exportedEntries.length,
      source_dictionary: 'UnifiedLibranDictionaryv1.7.0.json'
    },
    entries: exportedEntries
  }

  return NextResponse.json({
    success: true,
    message: 'Export completed successfully',
    data: exportData
  })
}

/**
 * Handle bulk dictionary operations with comprehensive error handling and logging
 */
async function handlePost(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('POST', '/api/admin/dictionary/bulk', requestId)

  try {
    const body: BulkOperationRequest = await request.json()
    const { operation, entries, data, variant = 'ancient' } = body

    // Validation
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_ENTRIES, { requestId })
      log.validationFail('entries', 'Entries array is required and must not be empty', requestId)
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Load dictionary data
    const dictionaryData = await loadDictionaryData(variant)

    let modified = false

    switch (operation) {
      case 'add_category':
      case 'addCategory':
        if (!data?.category) {
          const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_CATEGORY, { requestId })
          log.validationFail('category', 'Category is required for addCategory operation', requestId)
          return NextResponse.json(errorResponse.body, { status: errorResponse.status })
        }
        // Use the improved move function that actually moves entries between sections
        modified = await moveEntriesToCategory(dictionaryData, entries, data.category)
        break

      case 'add_tags':
        if (!data?.tags || !Array.isArray(data.tags)) {
          return NextResponse.json(
            { success: false, error: 'Tags array required' },
            { status: 400 }
          )
        }
        modified = await addTagsToEntries(dictionaryData, entries, data.tags)
        break

      case 'update_notes':
        if (!data?.notes) {
          return NextResponse.json(
            { success: false, error: 'Notes required' },
            { status: 400 }
          )
        }
        modified = await updateNotesForEntries(dictionaryData, entries, data.notes)
        break

      case 'delete':
        modified = await deleteEntries(dictionaryData, entries)
        break

      case 'export':
        return await exportEntries(dictionaryData, entries)

      case 'updateProperties':
        if (!data || typeof data !== 'object') {
          const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_UPDATES, { requestId })
          log.validationFail('updates', 'Updates object is required for updateProperties operation', requestId)
          return NextResponse.json(errorResponse.body, { status: errorResponse.status })
        }
        modified = await updateEntryProperties(dictionaryData, entries, data)
        break

      default:
        const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_OPERATION, { requestId })
        log.validationFail('operation', `Invalid operation: ${operation}`, requestId)
        return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Save changes if modified
    if (modified) {
      await saveDictionaryData(dictionaryData)
      
      log.info('Bulk operation completed', {
        event: LogEvents.DICTIONARY_BULK_EDIT,
        corr_id: requestId,
        ctx: { 
          operation, 
          variant, 
          entriesCount: entries.length,
          modified 
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Bulk operation '${operation}' completed successfully`,
      entries_processed: entries.length,
      modified
    })

  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCode.DICTIONARY_BULK_OPERATION_FAILED, { requestId }, error as Error)
    log.errorWithContext(error instanceof Error ? error : new Error('Unknown error'), LogEvents.DICTIONARY_BULK_EDIT_ERROR, requestId)
    
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  }
}

/**
 * Get bulk operation status or available operations
 */
async function handleGet(request: NextRequest) {
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
      availableOperations: ['add_category', 'add_tags', 'update_notes', 'delete', 'export', 'updateProperties']
    })

  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCode.DICTIONARY_LOAD_FAILED, { requestId }, error as Error)
    log.errorWithContext(error instanceof Error ? error : new Error('Unknown error'), LogEvents.DICTIONARY_LOAD_ERROR, requestId)
    
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  }
}

// Export secured handlers
export const GET = withAdminAuth(handleGet)
export const POST = withAdminAuth(handlePost)
