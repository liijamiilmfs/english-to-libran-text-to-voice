import { NextRequest } from 'next/server'
import { log, generateCorrelationId } from '@/lib/logger'

// Security configuration
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret-change-in-production'
const API_SECRET = process.env.API_SECRET || 'dev-api-secret-change-in-production'
const ADMIN_HEADER = 'X-Admin-Secret'
const API_HEADER = 'X-API-Secret'

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per window

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  if (!request.headers) {
    return 'test'
  }
  
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/**
 * Check rate limiting
 */
function checkRateLimit(request: NextRequest): boolean {
  const ip = getClientIP(request)
  const now = Date.now()
  
  const clientData = rateLimitStore.get(ip)
  
  if (!clientData || now > clientData.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }
  
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    log.warn('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      ctx: { ip, count: clientData.count, limit: RATE_LIMIT_MAX_REQUESTS }
    })
    return false
  }
  
  clientData.count++
  return true
}

/**
 * Verify admin authentication
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  const requestId = generateCorrelationId()
  const ip = getClientIP(request)
  
  // Always check rate limiting first
  if (!checkRateLimit(request)) {
    return false
  }
  
  // In development, allow without auth for local testing
  if (process.env.NODE_ENV === 'development') {
    log.debug('Admin auth bypassed in development mode', {
      corr_id: requestId,
      ctx: { environment: process.env.NODE_ENV, ip }
    })
    return true
  }

  // In production, require admin secret
  const providedSecret = request.headers?.get(ADMIN_HEADER)
  
  if (!providedSecret) {
    log.warn('Admin route accessed without authentication header', {
      event: 'ADMIN_AUTH_FAILED',
      corr_id: requestId,
      ctx: { 
        ip,
        userAgent: request.headers?.get('user-agent') || 'unknown',
        environment: process.env.NODE_ENV
      }
    })
    return false
  }

  if (providedSecret !== ADMIN_SECRET) {
    log.warn('Admin route accessed with invalid secret', {
      event: 'ADMIN_AUTH_FAILED',
      corr_id: requestId,
      ctx: { 
        ip,
        userAgent: request.headers?.get('user-agent') || 'unknown',
        environment: process.env.NODE_ENV,
        secretLength: providedSecret.length
      }
    })
    return false
  }

  log.info('Admin route authenticated successfully', {
    event: 'ADMIN_AUTH_SUCCESS',
    corr_id: requestId,
    ctx: { 
      environment: process.env.NODE_ENV,
      ip
    }
  })

  return true
}

/**
 * Verify API authentication for sensitive endpoints
 */
export function verifyApiAuth(request: NextRequest): boolean {
  const requestId = generateCorrelationId()
  const ip = getClientIP(request)
  
  // Always check rate limiting first
  if (!checkRateLimit(request)) {
    return false
  }
  
  // In development, allow without auth for local testing
  if (process.env.NODE_ENV === 'development') {
    log.debug('API auth bypassed in development mode', {
      corr_id: requestId,
      ctx: { environment: process.env.NODE_ENV, ip }
    })
    return true
  }

  // In production, require API secret for sensitive endpoints
  const providedSecret = request.headers?.get(API_HEADER)
  
  if (!providedSecret) {
    log.warn('Sensitive API route accessed without authentication header', {
      event: 'API_AUTH_FAILED',
      corr_id: requestId,
      ctx: { 
        ip,
        userAgent: request.headers?.get('user-agent') || 'unknown',
        environment: process.env.NODE_ENV
      }
    })
    return false
  }

  if (providedSecret !== API_SECRET) {
    log.warn('Sensitive API route accessed with invalid secret', {
      event: 'API_AUTH_FAILED',
      corr_id: requestId,
      ctx: { 
        ip,
        userAgent: request.headers?.get('user-agent') || 'unknown',
        environment: process.env.NODE_ENV,
        secretLength: providedSecret.length
      }
    })
    return false
  }

  log.info('API route authenticated successfully', {
    event: 'API_AUTH_SUCCESS',
    corr_id: requestId,
    ctx: { 
      environment: process.env.NODE_ENV,
      ip
    }
  })

  return true
}

/**
 * Middleware wrapper for admin routes
 */
export function withAdminAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    if (!verifyAdminAuth(request)) {
      const ip = getClientIP(request)
      
      // Check if it's rate limiting
      if (!checkRateLimit(request)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900' // 15 minutes
            }
          }
        )
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized access to admin endpoint',
          message: 'Admin authentication required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Admin-Secret'
          }
        }
      )
    }

    return handler(request)
  }
}

/**
 * Middleware wrapper for sensitive API routes
 */
export function withApiAuth(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    if (!verifyApiAuth(request)) {
      const ip = getClientIP(request)
      
      // Check if it's rate limiting
      if (!checkRateLimit(request)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '900' // 15 minutes
            }
          }
        )
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized access to sensitive endpoint',
          message: 'API authentication required'
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'API-Secret'
          }
        }
      )
    }

    return handler(request)
  }
}

/**
 * Environment-based security check
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get security configuration for documentation
 */
export function getSecurityConfig(): {
  adminHeader: string
  apiHeader: string
  rateLimit: { window: number; maxRequests: number }
  environment: string
} {
  return {
    adminHeader: ADMIN_HEADER,
    apiHeader: API_HEADER,
    rateLimit: {
      window: RATE_LIMIT_WINDOW,
      maxRequests: RATE_LIMIT_MAX_REQUESTS
    },
    environment: process.env.NODE_ENV || 'development'
  }
}
