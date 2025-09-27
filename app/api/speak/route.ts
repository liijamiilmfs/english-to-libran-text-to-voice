import { withGuardrails } from '@/lib/api-guardrails'
import { characteristicsToTTSParams, validateVoiceFilter } from '@/lib/dynamic-voice-filter'
import { ErrorCode, createErrorResponse } from '@/lib/error-taxonomy'
import { LogEvents, generateCorrelationId, log } from '@/lib/logger'
import { metrics } from '@/lib/metrics'
import { ttsCache } from '@/lib/tts-cache'
import { withUniversalSecurity } from '@/lib/universal-security'
import { VOICE_PROFILES, Voice, selectVoiceForCharacteristics } from '@/lib/voices'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'


async function handleSpeakRequest(request: NextRequest) {
  const startTime = Date.now()
  let success = false
  let characterCount = 0
  let audioDuration = 0
  let libranText = ''
  let voice = 'alloy'
  let selectedVoice: Voice = 'alloy' // Initialize selectedVoice for error handling
  const requestId = generateCorrelationId()

  log.apiRequest('POST', '/api/speak', requestId)

  try {
    const requestBody = await request.json()
    libranText = requestBody.libranText || ''
    voice = requestBody.voice || (process.env.OPENAI_TTS_VOICE ?? 'alloy')
    const format = requestBody.format || (process.env.AUDIO_FORMAT ?? 'mp3')

    // Validate and sanitize voice filter if provided
    const rawVoiceFilter = requestBody.voiceFilter;
    const voiceFilter = rawVoiceFilter ? validateVoiceFilter(rawVoiceFilter) : null;

    // Extract additional parameters for cache key
    const accent = requestBody.accent || null
    const simpleVoiceId = requestBody.simpleVoiceId || null

    // Debug logging
    if (rawVoiceFilter) {
      log.info('Voice filter received', {
        corr_id: requestId,
        ctx: {
          hasRawFilter: !!rawVoiceFilter,
          hasValidatedFilter: !!voiceFilter,
          rawFilterKeys: Object.keys(rawVoiceFilter),
          characteristicsKeys: rawVoiceFilter.characteristics ? Object.keys(rawVoiceFilter.characteristics) : 'none'
        }
      });
    }

    if (!libranText || typeof libranText !== 'string' || libranText.trim() === '') {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_MISSING_TEXT, { requestId })
      log.validationFail('libranText', 'libranText is required and must be a string', requestId)
      metrics.recordError('validation_error', 'libranText is required and must be a string')
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Select voice based on characteristics and accent
    selectedVoice = voice as Voice;
    const accentOverride = requestBody.accent;

    if (voiceFilter) {
      try {
        selectedVoice = selectVoiceForCharacteristics(voiceFilter, accentOverride);
        log.info('Voice selected based on characteristics and accent', {
          corr_id: requestId,
          ctx: {
            originalVoice: voice,
            selectedVoice: selectedVoice,
            voiceFilterPrompt: voiceFilter.prompt,
            accentOverride: accentOverride
          }
        });
      } catch (error) {
        log.error('Voice selection failed, using original voice', {
          corr_id: requestId,
          ctx: { error: error instanceof Error ? error.message : 'Unknown error', originalVoice: voice }
        });
        selectedVoice = voice as Voice;
      }
    } else if (accentOverride) {
      // If no voice filter but accent is specified, select a voice with that accent
      const voicesWithAccent = Object.values(VOICE_PROFILES).filter(v => v.accent === accentOverride);
      if (voicesWithAccent.length > 0) {
        selectedVoice = voicesWithAccent[0].id;
        log.info('Voice selected based on accent only', {
          corr_id: requestId,
          ctx: {
            originalVoice: voice,
            selectedVoice: selectedVoice,
            accentOverride: accentOverride
          }
        });
      } else {
        log.warn('No voices found with accent, using original voice', {
          corr_id: requestId,
          ctx: { accentOverride, originalVoice: voice }
        });
      }
    }

    // Validate voice parameter using the enhanced voice system
    const validVoices = Object.keys(VOICE_PROFILES) as Voice[]
    if (!validVoices.includes(selectedVoice)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_VOICE, { requestId, voice: selectedVoice })
      log.validationFail('voice', 'Invalid voice parameter', requestId, { voice: selectedVoice })
      metrics.recordError('validation_error', 'Invalid voice parameter')
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Validate format parameter
    const validFormats = ['mp3', 'wav', 'flac']
    if (!validFormats.includes(format)) {
      const errorResponse = createErrorResponse(ErrorCode.VALIDATION_INVALID_FORMAT, { requestId, format })
      log.validationFail('format', 'Invalid format parameter', requestId, { format })
      metrics.recordError('validation_error', 'Invalid format parameter')
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    characterCount = libranText.length

    // Log voice selection with enhanced metadata
    const voiceProfile = VOICE_PROFILES[selectedVoice]
    log.info('Starting TTS generation', {
      event: LogEvents.TTS_START,
      corr_id: requestId,
      ctx: {
        text_length: libranText.length,
        voice,
        voice_characteristics: voiceProfile.characteristics,
        voice_mood: voiceProfile.mood,
        voice_suitability: voiceProfile.libránSuitability,
        format,
        has_voice_filter: !!voiceFilter,
        voice_filter_prompt: voiceFilter?.prompt
      }
    })

    // Check cache first - include voice filter parameters for proper cache differentiation
    const model = process.env.OPENAI_TTS_MODEL ?? 'gpt-4o-mini-tts'
    const additionalParams: Record<string, any> = {}

    // Include voice filter characteristics if present
    if (voiceFilter) {
      additionalParams.voiceFilter = voiceFilter
    }

    // Include accent if present
    if (accent) {
      additionalParams.accent = accent
    }

    // Include simple voice ID if present
    if (simpleVoiceId) {
      additionalParams.simpleVoiceId = simpleVoiceId
    }

    const cacheKey = ttsCache.generateHash(libranText, voice, format, model, additionalParams)

    let audioBuffer: Buffer
    let isCacheHit = false

    // Try to get from cache
    const cachedAudio = await ttsCache.getCachedAudio(cacheKey)
    if (cachedAudio) {
      audioBuffer = cachedAudio
      isCacheHit = true
      log.ttsCacheHit(libranText, selectedVoice, requestId, { cacheKey, bufferSize: audioBuffer.length })
    } else {
      // Generate new audio using OpenAI TTS
      log.info('TTS cache miss, generating new audio', {
        event: LogEvents.TTS_CACHE_MISS,
        corr_id: requestId,
        ctx: { cacheKey }
      })
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY!
      });

      // Apply voice filter characteristics if provided
      const ttsParams = voiceFilter
        ? characteristicsToTTSParams(voiceFilter.characteristics)
        : { speed: voiceProfile.energy === 'low' ? 0.7 : voiceProfile.energy === 'high' ? 1.2 : 1.0 }

      // Debug TTS parameters
      log.info('TTS parameters generated', {
        corr_id: requestId,
        ctx: {
          hasVoiceFilter: !!voiceFilter,
          ttsSpeed: ttsParams.speed,
          voiceProfileSpeed: voiceProfile.energy === 'low' ? 0.7 : voiceProfile.energy === 'high' ? 1.2 : 1.0
        }
      });

      const response = await client.audio.speech.create({
        model: model,
        voice: selectedVoice as any,
        input: libranText,
        response_format: format as any,
        speed: ttsParams.speed
      });

      audioBuffer = Buffer.from(await response.arrayBuffer())

      // Store in cache for future use
      const wordCount = libranText.split(/\s+/).length
      const audioDuration = (wordCount / 150) * 60 // seconds

      await ttsCache.storeCachedAudio(
        cacheKey,
        libranText,
        voice,
        format,
        model,
        audioBuffer,
        audioDuration
      )
    }

    success = true

    // Estimate audio duration (rough calculation: ~150 words per minute for TTS)
    const wordCount = libranText.split(/\s+/).length
    audioDuration = (wordCount / 150) * 60 // seconds

    // Log TTS generation completion
    log.tts(libranText, selectedVoice, audioDuration * 1000, requestId, {
      format,
      wordCount,
      bufferSize: audioBuffer.length,
      cacheHit: isCacheHit,
      cacheKey: isCacheHit ? cacheKey : undefined
    })

    // Record TTS metrics
    metrics.recordTTSGeneration(audioDuration)

    // Set appropriate headers for audio streaming
    const headers = new Headers()
    const contentType = format === 'mp3' ? 'audio/mpeg' :
      format === 'wav' ? 'audio/wav' :
        'audio/flac'
    headers.set('Content-Type', contentType)
    headers.set('Content-Length', audioBuffer.length.toString())
    // Set cache headers based on whether this was a cache hit
    if (isCacheHit) {
      headers.set('Cache-Control', 'public, max-age=31536000') // 1 year for cached content
      headers.set('X-Cache-Status', 'HIT')
    } else {
      headers.set('Cache-Control', 'public, max-age=3600') // 1 hour for new content
      headers.set('X-Cache-Status', 'MISS')
    }
    headers.set('Content-Disposition', `attachment; filename="libran-audio.${format}"`)
    headers.set('X-Voice-Profile', JSON.stringify(voiceProfile))

    return new NextResponse(audioBuffer as any, {
      status: 200,
      headers
    })

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Handle specific OpenAI errors
    if (error.status === 429) {
      const errorResponse = createErrorResponse(ErrorCode.OPENAI_QUOTA_EXCEEDED, { requestId })
      log.ttsRateLimit(libranText || '', selectedVoice || 'alloy', requestId, { error: errorMessage })
      metrics.recordError('openai_quota_error', 'OpenAI quota exceeded')
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    if (error.type === 'insufficient_quota') {
      const errorResponse = createErrorResponse(ErrorCode.OPENAI_QUOTA_EXCEEDED, { requestId })
      log.ttsRateLimit(libranText || '', selectedVoice || 'alloy', requestId, { error: errorMessage })
      metrics.recordError('openai_quota_error', 'OpenAI insufficient quota')
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Handle other OpenAI errors
    if (error.name === 'OpenAIError') {
      const errorResponse = createErrorResponse(ErrorCode.OPENAI_API_ERROR, { requestId }, error)
      log.errorWithContext(error, LogEvents.EXTERNAL_API_ERROR, requestId, { api: 'openai' })
      metrics.recordError('openai_error', errorMessage)
      return NextResponse.json(errorResponse.body, { status: errorResponse.status })
    }

    // Handle general TTS errors
    const errorResponse = createErrorResponse(ErrorCode.TTS_GENERATION_FAILED, { requestId }, error)
    log.errorWithContext(error instanceof Error ? error : new Error(errorMessage), LogEvents.TTS_ERROR, requestId)
    metrics.recordError('tts_error', errorMessage)
    return NextResponse.json(errorResponse.body, { status: errorResponse.status })
  } finally {
    const responseTime = Date.now() - startTime
    log.apiResponse('POST', '/api/speak', success ? 200 : 500, responseTime, requestId, {
      success,
      characterCount,
      audioDuration: audioDuration * 1000 // Convert to milliseconds
    })
    log.performance('tts', responseTime, requestId, { success, audioDuration: audioDuration * 1000 })
    metrics.recordRequest('tts', success, responseTime, characterCount)
  }
}

// Export the guarded handler
export const POST = withUniversalSecurity(withGuardrails(handleSpeakRequest, {
  enableRateLimiting: true,
  enableBudgetGuardrails: true,
  requireUserId: false
}))