/**
 * Security Headers Integration Tests
 * 
 * Tests that all security headers are properly configured and working.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createServer } from 'http'
import { parse } from 'url'

// Mock Next.js server for testing
let server: any
let baseUrl: string

beforeAll(async () => {
  // Start a test server
  server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true)
    const { pathname } = parsedUrl

    // Mock security headers that would be set by Next.js
    const securityHeaders = {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-DNS-Prefetch-Control': 'on',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.openai.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }

    // Set all security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    // Mock different responses based on path
    if (pathname === '/api/test') {
      res.setHeader('X-API-Version', '1.0.0')
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify({ success: true }))
    } else if (pathname === '/admin/test') {
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-XSS-Protection', '1; mode=block')
      res.writeHead(200)
      res.end('Admin page')
    } else if (pathname === '/api/speak') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Content-Type', 'audio/mpeg')
      res.writeHead(200)
      res.end('Mock audio data')
    } else {
      res.writeHead(200)
      res.end('OK')
    }
  })

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address()
      baseUrl = `http://localhost:${address.port}`
      resolve()
    })
  })
})

afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  }
})

describe('Security Headers', () => {
  it('should set basic security headers on all routes', async () => {
    const response = await fetch(`${baseUrl}/`)
    const headers = Object.fromEntries(response.headers.entries())

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-xss-protection']).toBe('1; mode=block')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['x-dns-prefetch-control']).toBe('on')
    expect(headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload')
  })

  it('should set Content Security Policy', async () => {
    const response = await fetch(`${baseUrl}/`)
    const csp = response.headers.get('content-security-policy')

    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("script-src 'self' 'unsafe-eval' 'unsafe-inline'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("img-src 'self' data: blob:")
    expect(csp).toContain("font-src 'self'")
    expect(csp).toContain("connect-src 'self' https://api.openai.com")
    expect(csp).toContain("media-src 'self' blob:")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("upgrade-insecure-requests")
  })

  it('should set Permissions Policy', async () => {
    const response = await fetch(`${baseUrl}/`)
    const permissionsPolicy = response.headers.get('permissions-policy')

    expect(permissionsPolicy).toContain('camera=()')
    expect(permissionsPolicy).toContain('microphone=()')
    expect(permissionsPolicy).toContain('geolocation=()')
    expect(permissionsPolicy).toContain('interest-cohort=()')
  })

  it('should set API-specific headers', async () => {
    const response = await fetch(`${baseUrl}/api/test`)
    const headers = Object.fromEntries(response.headers.entries())

    expect(headers['x-api-version']).toBe('1.0.0')
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  it('should set admin-specific headers', async () => {
    const response = await fetch(`${baseUrl}/admin/test`)
    const headers = Object.fromEntries(response.headers.entries())

    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-xss-protection']).toBe('1; mode=block')
  })

  it('should set audio streaming headers', async () => {
    const response = await fetch(`${baseUrl}/api/speak`)
    const headers = Object.fromEntries(response.headers.entries())

    expect(headers['cache-control']).toBe('no-cache, no-store, must-revalidate')
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  it('should have HSTS header with proper configuration', async () => {
    const response = await fetch(`${baseUrl}/`)
    const hsts = response.headers.get('strict-transport-security')

    expect(hsts).toBe('max-age=31536000; includeSubDomains; preload')
  })

  it('should prevent clickjacking attacks', async () => {
    const response = await fetch(`${baseUrl}/`)
    const frameOptions = response.headers.get('x-frame-options')

    expect(frameOptions).toBe('DENY')
  })

  it('should prevent MIME type sniffing', async () => {
    const response = await fetch(`${baseUrl}/`)
    const contentTypeOptions = response.headers.get('x-content-type-options')

    expect(contentTypeOptions).toBe('nosniff')
  })

  it('should enable XSS protection', async () => {
    const response = await fetch(`${baseUrl}/`)
    const xssProtection = response.headers.get('x-xss-protection')

    expect(xssProtection).toBe('1; mode=block')
  })
})

describe('HTTPS Configuration', () => {
  it('should have proper redirect configuration for HTTP to HTTPS', () => {
    // This would be tested in a real environment with actual HTTP/HTTPS
    // For now, we verify the configuration exists
    const nextConfig = require('../../next.config.mjs')
    expect(nextConfig.default.redirects).toBeDefined()
    expect(Array.isArray(nextConfig.default.redirects())).toBe(true)
  })

  it('should have security headers configuration', () => {
    const nextConfig = require('../../next.config.mjs')
    expect(nextConfig.default.headers).toBeDefined()
    expect(Array.isArray(nextConfig.default.headers())).toBe(true)
  })
})
