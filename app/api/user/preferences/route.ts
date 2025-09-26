import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { log, generateCorrelationId } from '@/lib/logger'
import { withUniversalSecurity } from '@/lib/universal-security'

interface UserPreferences {
  userId: string
  voiceSettings?: {
    preferredVoice?: string
    voiceSpeed?: number
    voicePitch?: number
  }
  translationSettings?: {
    preferredAccent?: string
    autoTranslate?: boolean
  }
  uiSettings?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
  }
  createdAt: string
  updatedAt: string
}

// In-memory storage for demo purposes
// In production, this would be a database
const userPreferences = new Map<string, UserPreferences>()

async function handleGet(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('GET', '/api/user/preferences', requestId)

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (token.githubId as string) || token.sub
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in token' },
        { status: 401 }
      )
    }
    const preferences = userPreferences.get(userId)

    if (!preferences) {
      // Return default preferences for new users
      const defaultPreferences: UserPreferences = {
        userId,
        voiceSettings: {
          preferredVoice: 'alloy',
          voiceSpeed: 1.0,
          voicePitch: 1.0
        },
        translationSettings: {
          preferredAccent: 'standard',
          autoTranslate: false
        },
        uiSettings: {
          theme: 'auto',
          language: 'en'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      userPreferences.set(userId, defaultPreferences)
      
      log.info('Default preferences created for new user', {
        event: 'USER_PREFERENCES_CREATED',
        corr_id: requestId,
        ctx: { userId }
      })

      return NextResponse.json({
        success: true,
        data: defaultPreferences
      })
    }

    log.info('User preferences retrieved', {
      event: 'USER_PREFERENCES_RETRIEVED',
      corr_id: requestId,
      ctx: { userId }
    })

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    log.error('Error retrieving user preferences', {
      event: 'USER_PREFERENCES_ERROR',
      corr_id: requestId,
      ctx: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return NextResponse.json(
      { success: false, error: 'Failed to retrieve preferences' },
      { status: 500 }
    )
  }
}

async function handlePost(request: NextRequest) {
  const requestId = generateCorrelationId()
  log.apiRequest('POST', '/api/user/preferences', requestId)

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = (token.githubId as string) || token.sub
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in token' },
        { status: 401 }
      )
    }
    const body = await request.json()
    
    // Validate the request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Get existing preferences or create new ones
    const existingPreferences = userPreferences.get(userId) || {
      userId,
      voiceSettings: {},
      translationSettings: {},
      uiSettings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update preferences with new data
    const updatedPreferences: UserPreferences = {
      ...existingPreferences,
      voiceSettings: { ...existingPreferences.voiceSettings, ...body.voiceSettings },
      translationSettings: { ...existingPreferences.translationSettings, ...body.translationSettings },
      uiSettings: { ...existingPreferences.uiSettings, ...body.uiSettings },
      updatedAt: new Date().toISOString()
    }

    userPreferences.set(userId, updatedPreferences)

    log.info('User preferences updated', {
      event: 'USER_PREFERENCES_UPDATED',
      corr_id: requestId,
      ctx: { userId, updatedFields: Object.keys(body) }
    })

    return NextResponse.json({
      success: true,
      data: updatedPreferences
    })

  } catch (error) {
    log.error('Error updating user preferences', {
      event: 'USER_PREFERENCES_UPDATE_ERROR',
      corr_id: requestId,
      ctx: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export const GET = withUniversalSecurity(handleGet)
export const POST = withUniversalSecurity(handlePost)
