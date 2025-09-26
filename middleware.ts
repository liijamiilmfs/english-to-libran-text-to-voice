import { NextRequest, NextResponse } from 'next/server'
import { pageSecurityMiddleware, getSecurityHeaders } from './lib/universal-security-client'

export function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.url)
  
  // Apply universal security middleware
  const securityResponse = pageSecurityMiddleware(request)
  if (securityResponse) {
    return securityResponse
  }
  
  // If no redirect/block, continue without adding headers for now
  // (Security headers will be added by individual pages)
  return undefined
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
