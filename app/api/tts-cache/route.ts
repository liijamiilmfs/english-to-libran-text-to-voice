import { NextRequest, NextResponse } from 'next/server';
import { ttsCache } from '@/lib/tts-cache';
import { log } from '@/lib/logger';
import { withApiAuth } from '@/lib/api-security';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic'

async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        const cacheStats = await ttsCache.getCacheStats();
        return NextResponse.json({ success: true, data: cacheStats });

      case 'entries':
        const entries = await ttsCache.getCacheEntries();
        return NextResponse.json({ success: true, data: entries, count: entries.length });

      case 'size':
        const sizeStats = await ttsCache.getCacheStats();
        return NextResponse.json({ success: true, data: { size: sizeStats.totalSize } });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: stats, entries, or size' 
        }, { status: 400 });
    }
  } catch (error) {
    log.error('TTS Cache API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear':
        await ttsCache.clearCache();
        return NextResponse.json({ 
          success: true, 
          message: 'TTS cache cleared successfully' 
        });

      case 'cleanup':
        // Note: cleanupExpiredEntries is private, using clearCache as fallback
        await ttsCache.clearCache();
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully'
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: clear or cleanup' 
        }, { status: 400 });
    }
  } catch (error) {
    log.error('TTS Cache API error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Export secured handlers
export const GET = withApiAuth(handleGet)
export const POST = withApiAuth(handlePost)