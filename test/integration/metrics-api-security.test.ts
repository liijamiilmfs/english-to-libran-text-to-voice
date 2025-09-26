import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'module'

let GET: (request: any) => Promise<Response>

function createRequest(url: string, headers: Record<string, string> = {}) {
  const headerBag = new Headers(headers)

  return {
    url,
    headers: {
      get: (key: string) => headerBag.get(key) || null
    }
  } as any
}

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    enumerable: true,
    configurable: true,
    writable: true
  })
}

describe('GET /api/metrics - Security Tests', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const requireForTests = createRequire(__filename)

  before(async () => {
    setNodeEnv('production')
    const routePath = requireForTests.resolve('../../app/api/metrics/route')
    delete requireForTests.cache[routePath]
    const route = await import('../../app/api/metrics/route')
    GET = route.GET
  })

  after(() => {
    setNodeEnv(originalNodeEnv)
  })

  it('should return 401 for requests without authentication', async () => {
    const request = createRequest('http://localhost:3000/api/metrics')

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })

  it('should return 401 for requests with invalid API secret', async () => {
    const request = createRequest('http://localhost:3000/api/metrics', {
      'x-api-secret': 'invalid-secret'
    })

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })

  it('should return 401 for requests with missing API secret header', async () => {
    const request = createRequest('http://localhost:3000/api/metrics', {
      'x-admin-secret': 'wrong-header'
    })

    const response = await GET(request)
    assert.equal(response.status, 401)
    
    const body = await response.json()
    assert.equal(body.success, false)
    assert.ok(body.error.includes('Unauthorized'))
  })
})
