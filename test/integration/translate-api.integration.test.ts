import { describe, it, beforeAll, afterAll, vi } from 'vitest'
import { assert } from 'vitest'

let POST: (request: any) => Promise<Response>
let originalModuleLoad: any

// Mock the translator module
vi.mock('@/lib/translator', () => ({
  translate: vi.fn((text: string, variant: string) => {
    console.log('Mock translate called with:', text, variant)
    // Mock translation logic for testing
    if (text === 'balance memory' && variant === 'ancient') {
      console.log('Returning mock translation')
      return {
        libran: 'stílibror memorior',
        confidence: 1,
        wordCount: 2
      }
    }
    console.log('Returning original text')
    return {
      libran: text, // Return original text if no translation found
      confidence: 0,
      wordCount: text.split(/\s+/).length
    }
  })
}))

describe('POST /api/translate', () => {
  beforeAll(async () => {
    const Module = require('module')
    originalModuleLoad = Module._load

    Module._load = (request: string, parent: any, isMain: boolean) => {
      if (request === 'next/server') {
        return {
          NextResponse: class extends Response {
            static json(data: any, init?: { status?: number }) {
              return new Response(JSON.stringify(data), {
                status: init?.status ?? 200,
                headers: { 'content-type': 'application/json' }
              })
            }
          }
        }
      }

      if (request === '@/lib/metrics') {
        const metricsPath = `${process.cwd()}/dist-test/lib/metrics.js`
        return originalModuleLoad(metricsPath, parent, isMain)
      }

      return originalModuleLoad(request, parent, isMain)
    }

    const route = await import('../../app/api/translate/route')
    POST = route.POST
    Module._load = originalModuleLoad
  })

  it('returns a successful translation response', async () => {
    const request = {
      json: async () => ({ text: 'balance memory', variant: 'ancient' }),
      headers: new Map([['x-forwarded-for', '127.0.0.1']])
    } as any

    const response = await POST(request)
    assert.equal(response.status, 200)

    const body = await response.json()
    assert.equal(body.libran, 'stílibror memorior')
    assert.equal(body.confidence, 1)
    assert.equal(body.wordCount, 2)
    assert.equal(body.variant, 'ancient')
  })

  it('rejects invalid payloads', async () => {
    const request = {
      json: async () => ({ text: 123 }),
      headers: new Map([['x-forwarded-for', '127.0.0.1']])
    } as any

    const response = await POST(request)
    assert.equal(response.status, 400)

    const body = await response.json()
    assert.equal(body.error, 'Please enter some text to translate')
  })

  it('enforces allowed translation variants', async () => {
    const request = {
      json: async () => ({ text: 'Hello', variant: 'future' }),
      headers: new Map([['x-forwarded-for', '127.0.0.1']])
    } as any

    const response = await POST(request)
    assert.equal(response.status, 400)

    const body = await response.json()
    assert.equal(body.error, 'Please select either Ancient or Modern Librán variant')
  })

  afterAll(() => {
    // Restore original module load function
    if (originalModuleLoad) {
      const Module = require('module')
      Module._load = originalModuleLoad
    }
  })
})
