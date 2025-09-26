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

describe('GET /api/metrics - Authenticated Tests', () => {
  const originalNodeEnv = process.env.NODE_ENV
  const requireForTests = createRequire(__filename)

  before(async () => {
    setNodeEnv('test')
    const routePath = requireForTests.resolve('../../app/api/metrics/route')
    delete requireForTests.cache[routePath]
    const route = await import('../../app/api/metrics/route')
    GET = route.GET
  })

  after(() => {
    setNodeEnv(originalNodeEnv)
  })

  it('returns metrics in JSON format by default', async () => {
    const request = createRequest('http://localhost:3000/api/metrics')

    const response = await GET(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/json')

    const body = await response.json()
    assert.ok(body.totalRequests >= 0)
    assert.ok(body.failedRequests >= 0)
    assert.ok(body.startTime)
    assert.ok(body.uptime >= 0)
  })

  it('returns metrics in Prometheus format', async () => {
    const request = createRequest('http://localhost:3000/api/metrics?format=prometheus')

    const response = await GET(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'text/plain; version=0.0.4; charset=utf-8')

    const body = await response.text()
    assert.ok(body.includes('libran_total_requests'))
    assert.ok(body.includes('libran_successful_requests'))
    assert.ok(body.includes('# HELP'))
    assert.ok(body.includes('# TYPE'))
  })

  it('returns metrics in text format', async () => {
    const request = createRequest('http://localhost:3000/api/metrics?format=text')

    const response = await GET(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8')

    const body = await response.text()
    assert.ok(body.includes('=== Librán Voice Forge Metrics ==='))
    assert.ok(body.includes('Total Requests:'))
    assert.ok(body.includes('Uptime:'))
  })

  it('rejects invalid format parameter', async () => {
    const request = createRequest('http://localhost:3000/api/metrics?format=invalid')

    const response = await GET(request)
    assert.equal(response.status, 400)

    const body = await response.json()
    assert.equal(body.error, 'Invalid format parameter. Must be json, prometheus, or text')
  })

  it('sets appropriate cache headers', async () => {
    const request = createRequest('http://localhost:3000/api/metrics')

    const response = await GET(request)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-cache, no-store, must-revalidate')
    assert.equal(response.headers.get('pragma'), 'no-cache')
    assert.equal(response.headers.get('expires'), '0')
  })

  it('handles errors gracefully', async () => {
    const request = createRequest('http://localhost:3000/api/metrics')

    const response = await GET(request)
    assert.equal(response.status, 200)
  })
})
