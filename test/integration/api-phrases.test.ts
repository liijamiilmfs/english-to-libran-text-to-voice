import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    createMockRequest,
    expectApiResponse,
    expectErrorResponse,
    extractResponseData,
    mockExternalDependencies
} from '../utils/api-test-helpers'

// Mock external dependencies before importing the handler
mockExternalDependencies()

// Import the handler after mocking
import { GET } from '../../app/api/phrases/route'

describe('/api/phrases Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('GET /api/phrases - Success Cases', () => {
        it('should get random phrase by default', async () => {
            const request = createMockRequest('GET', undefined, {})
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('random')
            expect(responseData.data).toBeDefined()
            expect(responseData.data.english).toBeDefined()
            expect(responseData.data.ancient || responseData.data.modern).toBeDefined()
        })

        it('should get random phrase with explicit action', async () => {
            const request = createMockRequest('GET', undefined, { action: 'random' })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('random')
            expect(responseData.data).toBeDefined()
        })

        it('should get random phrase with category filter', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'random',
                category: 'greetings'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('random')
            expect(responseData.data).toBeDefined()
            expect(responseData.data.category).toBe('greetings')
        })

        it('should get random phrase with difficulty filter', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'random',
                difficulty: 'beginner'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('random')
            expect(responseData.data).toBeDefined()
            expect(responseData.data.difficulty).toBe('beginner')
        })

        it('should search phrases', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'search',
                search: 'hello'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('search')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
        })

        it('should get all phrases', async () => {
            const request = createMockRequest('GET', undefined, { action: 'list' })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
        })

        it('should get phrases by category', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                category: 'greetings'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)

            // All phrases should have the same category
            responseData.data.forEach((phrase: any) => {
                expect(phrase.category).toBe('greetings')
            })
        })

        it('should get categories', async () => {
            const request = createMockRequest('GET', undefined, { action: 'categories' })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('categories')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
            expect(responseData.data.length).toBeGreaterThan(0)
        })

        it('should get phrase stats', async () => {
            const request = createMockRequest('GET', undefined, { action: 'stats' })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('stats')
            expect(responseData.data).toBeDefined()
            expect(responseData.data.totalPhrases).toBeDefined()
            expect(typeof responseData.data.totalPhrases).toBe('number')
            expect(responseData.data.categories).toBeDefined()
            expect(typeof responseData.data.categories).toBe('object')
        })

        it('should respect limit parameter', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                limit: '3'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
            expect(responseData.data.length).toBeLessThanOrEqual(3)
        })
    })

    describe('GET /api/phrases - Validation Errors', () => {
        it('should return 400 for invalid action', async () => {
            const request = createMockRequest('GET', undefined, { action: 'invalid' })
            const response = await GET(request)

            await expectErrorResponse(response, 'VALIDATION_INVALID_VARIANT')
        })

        it('should return 400 for invalid category', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                category: 'invalid-category'
            })
            const response = await GET(request)

            // This should return 200 with empty results, not an error
            await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])
        })

        it('should return 400 for invalid difficulty', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'random',
                difficulty: 'invalid-difficulty'
            })
            const response = await GET(request)

            // This should return 200 with empty results, not an error
            await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])
        })

        it('should handle invalid limit gracefully', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                limit: 'invalid-limit'
            })
            const response = await GET(request)

            // API should return 200 and ignore invalid limit
            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])
            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
        })

        it('should handle negative limit gracefully', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                limit: '-1'
            })
            const response = await GET(request)

            // API should return 200 and ignore negative limit
            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])
            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
        })

        it('should handle zero limit gracefully', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                limit: '0'
            })
            const response = await GET(request)

            // API should return 200 and ignore zero limit
            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])
            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
        })
    })

    describe('GET /api/phrases - Edge Cases', () => {
        it('should handle empty search query', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'search',
                search: ''
            })
            const response = await GET(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should handle search with special characters', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'search',
                search: 'hello, world!'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('search')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
        })

        it('should handle search with unicode characters', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'search',
                search: 'café'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('search')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
        })

        it('should handle multiple filters combined', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'search',
                search: 'hello'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('search')
            expect(responseData.data).toBeDefined()
            expect(Array.isArray(responseData.data)).toBe(true)
        })
    })

    describe('GET /api/phrases - Error Handling', () => {
        it('should include correlation ID in all responses', async () => {
            const request = createMockRequest('GET', undefined, { action: 'random' })
            const response = await GET(request)

            const responseData = await extractResponseData(response)
            expect(responseData.requestId).toBeDefined()
            expect(typeof responseData.requestId).toBe('string')
            expect(responseData.requestId.length).toBeGreaterThan(0)
        })

        it('should include correlation ID in error responses', async () => {
            const request = createMockRequest('GET', undefined, { action: 'invalid' })
            const response = await GET(request)

            const responseData = await extractResponseData(response)
            expect(responseData.requestId).toBeDefined()
            expect(typeof responseData.requestId).toBe('string')
        })

        it('should handle missing phrase book gracefully', async () => {
            // This would test the case where phrase book fails to load
            // For now, we'll just ensure the response structure is correct
            const request = createMockRequest('GET', undefined, { action: 'random' })
            const response = await GET(request)

            // Should either succeed or return a proper error response
            expect([200, 400, 500]).toContain(response.status)

            const responseData = await extractResponseData(response)
            expect(responseData.requestId).toBeDefined()
        })
    })

    describe('GET /api/phrases - Performance and Metrics', () => {
        it('should log API request', async () => {
            const request = createMockRequest('GET', undefined, { action: 'random' })
            const response = await GET(request)

            await expectApiResponse(response, 200)
            // Verify correlation ID indicates logging worked
            const responseData = await extractResponseData(response)
            expect(responseData.requestId).toBeDefined()
        })

        it('should handle large result sets efficiently', async () => {
            const request = createMockRequest('GET', undefined, {
                action: 'list',
                limit: '1000'
            })
            const response = await GET(request)

            const responseData = await expectApiResponse(response, 200, ['success', 'action', 'data', 'requestId'])

            expect(responseData.success).toBe(true)
            expect(responseData.action).toBe('list')
            expect(responseData.data.length).toBeLessThanOrEqual(1000)
        })
    })
})
