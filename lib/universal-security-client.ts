import { NextRequest, NextResponse } from 'next/server'

// Security configuration
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-admin-secret-change-in-production'
const API_SECRET = process.env.API_SECRET || 'dev-api-secret-change-in-production'
const ADMIN_HEADER = 'X-Admin-Secret'
const API_HEADER = 'X-API-Secret'
const IS_TEST_ENV = process.env.NODE_ENV === 'test'
const IS_DEV_ENV = process.env.NODE_ENV === 'development'

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
    return true
  }

  const apiSecret = request.headers.get(API_HEADER)
  return apiSecret === API_SECRET
}

/**
 * Create unauthorized response
 */
function createUnauthorizedResponse(message: string, request: NextRequest): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message
    },
    { status: 401 }
  )
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
