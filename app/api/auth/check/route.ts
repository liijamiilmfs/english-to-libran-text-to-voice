import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('Auth check API called')
  
  // Simple auth check - in development/test, always return success
  const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  
  if (isDev) {
    console.log('Development mode - allowing access')
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Authentication verified (dev mode)'
    })
  }
  
  // In production, check for API secret
  const apiSecret = request.headers.get('X-API-Secret')
  const expectedSecret = process.env.API_SECRET || 'dev-api-secret-change-in-production'
  
  if (apiSecret === expectedSecret) {
    console.log('Valid API secret provided')
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Authentication verified'
    })
  }
  
  console.log('Invalid or missing API secret')
  return NextResponse.json({
    success: false,
    authenticated: false,
    message: 'Authentication required'
  }, { status: 401 })
}
