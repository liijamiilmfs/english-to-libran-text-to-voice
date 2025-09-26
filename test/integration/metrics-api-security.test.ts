import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'

let GET: (request: any) => Promise<Response>

describe('GET /api/metrics - Security Tests', () => {
  before(async () => {
    const Module = require('module')
    const originalLoad = Module._load

    Module._load = (request: string, parent: any, isMain: boolean) => {
      if (request === 'next/server') {
        return {
          NextRequest: class {
            constructor(public url: string) {}
            headers = {
              get: (key: string) => null // No authentication headers
            }
          },
          NextResponse: class extends Response {
            static json(data: any, init?: { status?: number }) {
              return new Response(JSON.stringify(data), {
                status: init?.status ?? 200,
                headers: { 'content-type': 'application/json' }
              })
            }
            static text(data: string, init?: { status?: number }) {
              return new Response(data, {
                status: init?.status ?? 200,
                headers: { 'content-type': 'text/plain' }
              })
            }
          }
        }
      }

      if (request === '@/lib/metrics') {
        const metricsPath = `${process.cwd()}/dist-test/lib/metrics.js`
        return originalLoad(metricsPath, parent, isMain)
      }

      return originalLoad(request, parent, isMain)
    }

    const route = await import('../../app/api/metrics/route')
    GET = route.GET
    Module._load = originalLoad
  })

  it('should return 401 for requests without authentication', async () => {
    const request = {
      url: 'http://localhost:3000/api/metrics'
    } as any

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })

  it('should return 401 for requests with invalid API secret', async () => {
    const request = {
      url: 'http://localhost:3000/api/metrics',
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            'x-api-secret': 'invalid-secret'
          }
          return headers[key] || null
        }
      }
    } as any

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })

  it('should return 401 for requests with missing API secret header', async () => {
    const request = {
      url: 'http://localhost:3000/api/metrics',
      headers: {
        get: (key: string) => {
          const headers: Record<string, string> = {
            'x-admin-secret': 'wrong-header'
          }
          return headers[key] || null
        }
      }
    } as any

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })
})
