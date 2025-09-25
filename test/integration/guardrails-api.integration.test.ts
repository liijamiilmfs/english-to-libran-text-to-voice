/**
 * Guardrails API Integration Tests
 */

// Set test environment before any imports
process.env.NODE_ENV = 'test'

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest'
import { assert } from 'vitest'
import { NextRequest } from 'next/server'
import { withGuardrails, resetGuardrails } from '../../lib/api-guardrails'

describe('Guardrails API Integration', () => {
  beforeAll(() => {
    resetGuardrails()
  })

  afterAll(() => {
    resetGuardrails()
  })

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: true,
        enableBudgetGuardrails: false,
        requireUserId: false
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      })

      const response = await guardedHandler(request)
      assert.equal(response.status, 200)
    })

    it('should block requests exceeding rate limit', async () => {
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: true,
        enableBudgetGuardrails: false,
        requireUserId: false
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      })

      // Make requests up to the burst limit (1000 in test mode)
      for (let i = 0; i < 1000; i++) {
        const response = await guardedHandler(request)
        assert.equal(response.status, 200)
      }

      // Make additional requests to exceed the burst limit
      for (let i = 0; i < 10; i++) {
        const response = await guardedHandler(request)
        if (response.status === 429) {
          const body = await response.json()
          assert.equal(body.error, 'Rate limit exceeded')
          assert.ok(body.retryAfter)
          return // Test passed
        }
      }
      
      // If we get here, rate limiting didn't work
      assert.fail('Rate limiting should have kicked in after 1000 requests')
    })
  })

  describe('Budget Guardrails', () => {
    beforeEach(async () => {
      // Reset budget state before each test
      const { budgetGuardrails } = await import('../../lib/budget-guardrails')
      budgetGuardrails.reset()
    })

    it('should allow requests within budget', async () => {
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: false,
        enableBudgetGuardrails: true,
        requireUserId: false
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      })

      const response = await guardedHandler(request)
      assert.equal(response.status, 200)
    })

    it('should block requests exceeding per-request character limit', async () => {
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: false,
        enableBudgetGuardrails: true,
        requireUserId: false
      })

      // Create a request with text exceeding the per-request limit (100k chars in test mode)
      const largeText = 'a'.repeat(150000)
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: largeText })
      })

      const response = await guardedHandler(request)
      assert.equal(response.status, 429)
      
      const body = await response.json()
      assert.equal(body.error, 'Budget exceeded')
      assert.ok(body.message.includes('exceeds maximum characters per request'))
    })

    it('should block requests exceeding daily character limit', async () => {
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: false,
        enableBudgetGuardrails: true,
        requireUserId: false
      })

      // Create requests that will exceed daily limit (10M chars in test mode)
      // Use 50K chars per request (within per-request limit of 100K) but will exceed daily limit
      const largeText = 'a'.repeat(50000) // 50K chars per request
      
      // Make requests up to just under the daily limit (10M chars in test mode)
      // With 50K chars per request, we need 200 requests to reach 10M chars
      for (let i = 0; i < 200; i++) {
        const request = new NextRequest('http://localhost:3000/api/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: largeText })
        })
        
        const response = await guardedHandler(request)
        assert.equal(response.status, 200)
      }

      // Next request should exceed daily limit
      const request2 = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: largeText })
      })

      const response2 = await guardedHandler(request2)
      assert.equal(response2.status, 429)
      
      const body = await response2.json()
      assert.equal(body.error, 'Budget exceeded')
      assert.ok(body.message.includes('Daily character limit exceeded'))
    })
  })

  describe('Combined Guardrails', () => {
    it('should apply both rate limiting and budget guardrails', async () => {
      // Reset budget state before test
      const { budgetGuardrails } = await import('../../lib/budget-guardrails')
      budgetGuardrails.reset()
      
      const mockHandler = async (_request: NextRequest) => {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: true,
        enableBudgetGuardrails: true,
        requireUserId: false
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      })

      // Should work within limits
      const response = await guardedHandler(request)
      assert.equal(response.status, 200)
      
      // Check headers are present
      assert.ok(response.headers.get('X-RateLimit-Limit'))
      assert.ok(response.headers.get('X-Budget-Remaining-Daily'))
    })
  })

  describe('Error Handling', () => {
    it('should handle handler errors gracefully', async () => {
      const mockHandler = async (_request: NextRequest) => {
        throw new Error('Handler error')
      }

      const guardedHandler = withGuardrails(mockHandler, {
        enableRateLimiting: false,
        enableBudgetGuardrails: false,
        requireUserId: false
      })

      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      })

      const response = await guardedHandler(request)
      assert.equal(response.status, 500)
      
      const body = await response.json()
      assert.equal(body.error, 'Internal server error')
    })
  })
})
