import { NextRequest, NextResponse } from 'next/server';
import { unknownTokenLogger } from '@/lib/unknown-token-logger';
import { log } from '@/lib/logger';
import { withApiAuth } from '@/lib/api-security';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'list':
        const tokens = await unknownTokenLogger.getUnknownTokens();
        return NextResponse.json({ 
          success: true, 
          data: tokens,
          count: tokens.length 
        });
        
      case 'export':
        const exportData = await unknownTokenLogger.exportTokens();
        return NextResponse.json({ 
          success: true, 
          data: exportData,
          count: exportData.length 
        });
        
      case 'stats':
        const stats = await unknownTokenLogger.getTokenStats();
        return NextResponse.json({ 
          success: true, 
          data: stats 
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: list, export, or stats' 
        }, { status: 400 });
    }
  } catch (error) {
    log.error('Unknown tokens API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, variant, context, userAgent, sessionId } = body;
    
    if (!token || !variant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token and variant are required' 
      }, { status: 400 });
    }
    
    await unknownTokenLogger.logUnknownToken(token, variant, {
      context: context || '',
      userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
      sessionId: sessionId || 'unknown',
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Token logged successfully' 
    });
  } catch (error) {
    log.error('Unknown tokens API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Export secured handlers
export const GET = withApiAuth(handleGet)
export const POST = withApiAuth(handlePost)