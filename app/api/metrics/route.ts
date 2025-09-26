import { NextRequest, NextResponse } from 'next/server'
import { formatMetrics } from '@/lib/metrics'
import { log, generateCorrelationId, LogEvents } from '@/lib/logger'
import { withApiAuth } from '@/lib/api-security'

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic'

async function handleGet(request: NextRequest) {
  const requestId = generateCorrelationId()
  const startTime = Date.now()
  
  log.apiRequest('GET', '/api/metrics', requestId)

  try {
    const url = new URL(request.url)
    const format = url.searchParams.get('format') as 'json' | 'prometheus' | 'text' || 'json'
    
    log.info('Metrics request', {
      event: 'METRICS_REQUEST',
      corr_id: requestId,
      ctx: { format }
    })

    const metrics = await formatMetrics(format)
    
    const duration = Date.now() - startTime
    log.info('Metrics request completed', {
      event: 'METRICS_RESPONSE',
      corr_id: requestId,
      ctx: { 
        format,
        duration,
        responseSize: metrics.length
      }
    })

    const headers: Record<string, string> = {
      'Content-Type': format === 'prometheus' ? 'text/plain; version=0.0.4; charset=utf-8' : 'application/json'
    }

    return new NextResponse(metrics, { 
      status: 200,
      headers
    })

  } catch (error) {
    const duration = Date.now() - startTime
    log.errorWithContext(
      error instanceof Error ? error : new Error('Unknown error'),
      LogEvents.API_ERROR,
      requestId,
      { duration }
    )
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Export secured handler
export const GET = withApiAuth(handleGet)