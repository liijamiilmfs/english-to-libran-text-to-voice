import { NextRequest, NextResponse } from 'next/server'
import { log, generateCorrelationId } from '@/lib/logger'
import { getToken } from 'next-auth/jwt'

// Security configuration
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret-change-in-production'
const API_SECRET = process.env.API_SECRET || 'dev-api-secret-change-in-production'
const ADMIN_HEADER = 'X-Admin-Secret'
const API_HEADER = 'X-API-Secret'
const IS_TEST_ENV = process.env.NODE_ENV === 'test'
const IS_DEV_ENV = process.env.NODE_ENV === 'development'

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per window

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/error',
  '/api/auth/[...nextauth]'
]

// Admin routes that require admin secret
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin'
]

// API routes that require API secret
const API_ROUTES = [
  '/api/translate',
  '/api/speak',
  '/api/speak-clean',
  '/api/phrases',
  '/api/tts-cache',
  '/api/unknown-tokens',
  '/api/metrics',
  '/api/guardrails-status'
]

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
      corr_id: generateCorrelationId(),
      ctx: { ip, count: clientData.count, resetTime: clientData.resetTime }
    })
    return false
  }
  
  // Increment counter
  clientData.count++
  rateLimitStore.set(ip, clientData)
  return true
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )
}

/**
 * Check if route is admin route
 */
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  )
}

/**
 * Check if route is API route
 */
function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some(route => 
    pathname.startsWith(route)
  )
}

/**
 * Verify admin authentication
 */
function verifyAdminAuth(request: NextRequest): boolean {
  if (IS_TEST_ENV || IS_DEV_ENV) {
    log.debug('Admin auth bypassed in development/test mode', {
      event: 'ADMIN_AUTH_BYPASS',
      corr_id: generateCorrelationId(),
      ctx: { environment: process.env.NODE_ENV, ip: getClientIP(request) }
    })
    return true
  }

  const adminSecret = request.headers.get(ADMIN_HEADER)
  return adminSecret === ADMIN_SECRET
}

/**
 * Verify API authentication
 */
function verifyApiAuth(request: NextRequest): boolean {
  if (IS_TEST_ENV || IS_DEV_ENV) {
    log.debug('API auth bypassed in development/test mode', {
      event: 'API_AUTH_BYPASS',
      corr_id: generateCorrelationId(),
      ctx: { environment: process.env.NODE_ENV, ip: getClientIP(request) }
    })
    return true
  }

  const apiSecret = request.headers.get(API_HEADER)
  return apiSecret === API_SECRET
}

/**
 * Check if user is authenticated via NextAuth
 */
async function verifyUserAuth(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    return !!token
  } catch (error) {
    log.error('Error verifying user authentication', {
      event: 'USER_AUTH_ERROR',
      corr_id: generateCorrelationId(),
      ctx: { error: error instanceof Error ? error.message : 'Unknown error' }
    })
    return false
  }
}

/**
 * Create unauthorized response
 */
function createUnauthorizedResponse(message: string, request: NextRequest): NextResponse {
  const corrId = generateCorrelationId()
  
  log.warn('Unauthorized access attempt', {
    event: 'UNAUTHORIZED_ACCESS',
    corr_id: corrId,
    ctx: { 
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
        path: new URL(request.url).pathname,
      method: request.method
    }
  })

  return NextResponse.json(
    { 
      success: false, 
      error: message,
      corr_id: corrId
    },
    { status: 401 }
  )
}

/**
 * Create rate limit response
 */
function createRateLimitResponse(request: NextRequest): NextResponse {
  const corrId = generateCorrelationId()
  
  log.warn('Rate limit exceeded', {
    event: 'RATE_LIMIT_EXCEEDED',
    corr_id: corrId,
    ctx: { 
      ip: getClientIP(request),
        path: new URL(request.url).pathname,
      method: request.method
    }
  })

  return NextResponse.json(
    { 
      success: false, 
      error: 'Rate limit exceeded. Please try again later.',
      corr_id: corrId
    },
    { status: 429 }
  )
}

/**
 * Universal security middleware for all routes
 */
export function withUniversalSecurity(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = new URL(request.url).pathname
    const corrId = generateCorrelationId()

    // Log all requests
    log.info('Request received', {
      event: 'REQUEST_RECEIVED',
      corr_id: corrId,
      ctx: {
        method: request.method,
        path: pathname,
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      }
    })

    // Check rate limiting first
    if (!checkRateLimit(request)) {
      return createRateLimitResponse(request)
    }

    // Skip authentication for public routes
    if (isPublicRoute(pathname)) {
      log.debug('Public route accessed', {
        event: 'PUBLIC_ROUTE_ACCESS',
        corr_id: corrId,
        ctx: { path: pathname }
      })
      return handler(request)
    }

    // Check admin authentication
    if (isAdminRoute(pathname)) {
      if (!verifyAdminAuth(request)) {
        return createUnauthorizedResponse('Admin access required', request)
      }
      
      log.debug('Admin route accessed', {
        event: 'ADMIN_ROUTE_ACCESS',
        corr_id: corrId,
        ctx: { path: pathname }
      })
      return handler(request)
    }

    // Check API authentication (user auth or API secret)
    if (isApiRoute(pathname)) {
      const isUserAuthenticated = await verifyUserAuth(request)
      const isApiSecretValid = verifyApiAuth(request)
      
      if (!isUserAuthenticated && !isApiSecretValid) {
        return createUnauthorizedResponse('Authentication required', request)
      }
      
      log.debug('API route accessed', {
        event: 'API_ROUTE_ACCESS',
        corr_id: corrId,
        ctx: { 
          path: pathname,
          authType: isUserAuthenticated ? 'user' : 'api_secret'
        }
      })
      return handler(request)
    }

    // For all other routes, require API authentication
    if (!verifyApiAuth(request)) {
      return createUnauthorizedResponse('Authentication required', request)
    }

    log.debug('Protected route accessed', {
      event: 'PROTECTED_ROUTE_ACCESS',
      corr_id: corrId,
      ctx: { path: pathname }
    })

    return handler(request)
  }
}

/**
 * Middleware for page routes (Next.js middleware)
 */
export function pageSecurityMiddleware(request: NextRequest): NextResponse | null {
  const pathname = new URL(request.url).pathname

  // Skip authentication for public routes
  if (isPublicRoute(pathname)) {
    return null // Allow request to continue
  }

  // For admin routes, check admin auth
  if (isAdminRoute(pathname)) {
    if (!verifyAdminAuth(request)) {
      return NextResponse.redirect(new URL('/auth/signin?error=admin_required', request.url))
    }
    return null
  }

  // For all other routes, require API authentication
  if (!verifyApiAuth(request)) {
    return NextResponse.redirect(new URL('/auth/signin?error=authentication_required', request.url))
  }

  return null
}

/**
 * Security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  }
}
