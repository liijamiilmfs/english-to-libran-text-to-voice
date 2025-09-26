import { NextRequest, NextResponse } from 'next/server'
import { withUniversalSecurity } from '@/lib/universal-security'

async function checkAuthHandler(request: NextRequest) {
  // If we reach here, authentication has already been verified by the middleware
  return NextResponse.json({
    success: true,
    authenticated: true,
    message: 'Authentication verified'
  })
}

export const GET = withUniversalSecurity(checkAuthHandler)
