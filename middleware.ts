import { NextRequest, NextResponse } from 'next/server'
import { pageSecurityMiddleware, getSecurityHeaders } from '@/lib/universal-security'

export function middleware(request: NextRequest) {
  const response = pageSecurityMiddleware(request)
  
  if (response) {
    // Add security headers to redirects
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // For allowed requests, add security headers
  const nextResponse = new NextResponse(null)
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    nextResponse.headers.set(key, value)
  })

  return nextResponse
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
