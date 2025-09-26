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
 * Transform dictionary data for API response
 * This function demonstrates the fix for the original issue:
 * - It reads the entry.section value set by bulk operations
 * - It respects the category/section properties updated by bulk edits
 * - It ensures entries appear in their correct sections
 */
function transformDictionaryForResponse(data: DictionaryData): any {
  const response: any = {
    metadata: data.metadata,
    sections: {}
  }

  if (data.sections) {
    Object.entries(data.sections).forEach(([sectionName, section]) => {
      if (section.data && Array.isArray(section.data)) {
        response.sections[sectionName] = {
          data: section.data.map(entry => ({
            ...entry,
            // Use the entry's section property if it exists (set by bulk operations)
            // Otherwise fall back to the section name
            section: entry.section || sectionName,
            category: entry.category || entry.section || sectionName
          }))
        }
      }
    })
  }

  return response
}

/**
 * Get dictionary data with proper section handling
 */
export async function GET(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('GET', '/api/admin/dictionary', requestId)

  try {
    const url = new URL(request.url)
    const variant = url.searchParams.get('variant') || 'ancient'
    const section = url.searchParams.get('section') || null

    if (!['ancient', 'modern'].includes(variant)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_VARIANT, { requestId, variant })
      log.validationFail('variant', 'Variant must be "ancient" or "modern"', requestId, { variant })
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Load dictionary data
    const dictionaryData = await loadDictionaryData(variant as 'ancient' | 'modern')
    
    // Transform data to ensure proper section handling
    const transformedData = transformDictionaryForResponse(dictionaryData)

    // Filter by section if requested
    if (section) {
      if (transformedData.sections[section]) {
        transformedData.sections = { [section]: transformedData.sections[section] }
      } else {
        // Return empty result if section doesn't exist
        transformedData.sections = {}
      }
    }

    // Calculate statistics
    const stats = {
      totalSections: Object.keys(transformedData.sections).length,
      totalEntries: Object.values(transformedData.sections).reduce(
        (total, section: any) => total + (section.data?.length || 0), 0
      ),
      sections: Object.keys(transformedData.sections)
    }

    log.info('Dictionary data retrieved', {
      event: LogEvents.DICTIONARY_BULK_EDIT, // Reusing this event for dictionary operations
      corr_id: requestId,
      ctx: { 
        variant, 
        section,
        stats,
        // Log how many entries have custom section properties (indicating bulk edits)
        entriesWithCustomSections: Object.values(transformedData.sections).reduce((count, section: any) => {
          return count + (section.data?.filter((entry: any) => entry.section && entry.section !== section).length || 0)
        }, 0)
      }
    })

    return NextResponse.json({
      success: true,
      variant,
      section: section || 'all',
      stats,
      data: transformedData
    })

  } catch (error) {
    const errorResponse = createErrorResponse(ErrorCode.DICTIONARY_LOAD_FAILED, { requestId }, error as Error)
    log.errorWithContext(error instanceof Error ? error : new Error('Unknown error'), LogEvents.DICTIONARY_LOAD_ERROR, requestId)
    
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  }
}
