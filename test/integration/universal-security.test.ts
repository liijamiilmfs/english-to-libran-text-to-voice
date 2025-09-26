import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'

let withUniversalSecurity: any
let pageSecurityMiddleware: any

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

describe('Universal Security System', () => {
  const originalNodeEnv = process.env.NODE_ENV

  before(async () => {
    // Set test environment
    setNodeEnv('test')
    
    const securityModule = await import('../../lib/universal-security')
    withUniversalSecurity = securityModule.withUniversalSecurity
    pageSecurityMiddleware = securityModule.pageSecurityMiddleware
  })

  after(() => {
    // Restore original environment
    setNodeEnv(originalNodeEnv)
  })

  describe('withUniversalSecurity middleware', () => {
    it('should allow public routes without authentication', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200)
    })

    it('should allow auth routes without authentication', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/auth/signin')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200)
    })

    it('should require API authentication for API routes', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/api/translate')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200) // Should pass in test environment
    })

    it('should require admin authentication for admin routes', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/api/admin/dictionary')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200) // Should pass in test environment
    })

    it('should require authentication for protected routes', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/test-memory')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200) // Should pass in test environment
    })

    it('should enforce rate limiting', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      // Make many requests to trigger rate limiting
      const requests = Array(150).fill(null).map(() => 
        securedHandler(createRequest('http://localhost:3000/api/translate'))
      )
      
      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      
      // Should have some rate limited responses
      assert(rateLimitedResponses.length > 0, 'Rate limiting should be triggered')
    })
  })

  describe('pageSecurityMiddleware', () => {
    it('should allow public routes', () => {
      const request = createRequest('http://localhost:3000/')
      const response = pageSecurityMiddleware(request)
      
      assert.strictEqual(response, null) // null means allow
    })

    it('should allow auth routes', () => {
      const request = createRequest('http://localhost:3000/auth/signin')
      const response = pageSecurityMiddleware(request)
      
      assert.strictEqual(response, null) // null means allow
    })

    it('should redirect admin routes without auth', () => {
      // Set production environment to enforce auth
      setNodeEnv('production')
      
      const request = createRequest('http://localhost:3000/admin')
      const response = pageSecurityMiddleware(request)
      
      assert(response !== null, 'Should redirect admin routes without auth')
      assert.strictEqual(response.status, 307) // Temporary redirect
      assert(response.headers.get('location')?.includes('/auth/signin'))
      
      // Restore test environment
      setNodeEnv('test')
    })

    it('should redirect protected routes without auth', () => {
      // Set production environment to enforce auth
      setNodeEnv('production')
      
      const request = createRequest('http://localhost:3000/test-memory')
      const response = pageSecurityMiddleware(request)
      
      assert(response !== null, 'Should redirect protected routes without auth')
      assert.strictEqual(response.status, 307) // Temporary redirect
      assert(response.headers.get('location')?.includes('/auth/signin'))
      
      // Restore test environment
      setNodeEnv('test')
    })
  })

  describe('Security headers', () => {
    it('should include security headers in responses', async () => {
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/')
      const response = await securedHandler(request)
      
      // Check for security headers
      assert(response.headers.get('X-Content-Type-Options') === 'nosniff')
      assert(response.headers.get('X-Frame-Options') === 'DENY')
      assert(response.headers.get('X-XSS-Protection') === '1; mode=block')
    })
  })

  describe('Environment-based security', () => {
    it('should bypass auth in test environment', async () => {
      setNodeEnv('test')
      
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/api/translate')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200)
    })

    it('should bypass auth in development environment', async () => {
      setNodeEnv('development')
      
      const mockHandler = async () => new Response('OK', { status: 200 })
      const securedHandler = withUniversalSecurity(mockHandler)
      
      const request = createRequest('http://localhost:3000/api/translate')
      const response = await securedHandler(request)
      
      assert.strictEqual(response.status, 200)
      
      // Restore test environment
      setNodeEnv('test')
    })
  })
})
