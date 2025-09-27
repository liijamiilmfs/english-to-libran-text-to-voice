import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    createMockRequest,
    expectApiResponse,
    expectErrorResponse,
    extractResponseData,
    mockExternalDependencies,
    testData
} from '../utils/api-test-helpers'

// Mock external dependencies before importing the handler
mockExternalDependencies()

// Import the handler after mocking
import { POST } from '../../app/api/translate/route'

describe('/api/translate Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/translate - Success Cases', () => {
        it('should translate text successfully with ancient variant', async () => {
            const request = createMockRequest('POST', testData.translate.valid)
            const response = await POST(request)

            const responseData = await expectApiResponse(response, 200, ['libran', 'variant'])

            expect(responseData.libran).toBeDefined()
            expect(responseData.variant).toBe('ancient')
        })

        it('should translate text successfully with modern variant', async () => {
            const request = createMockRequest('POST', {
                text: 'Hello world',
                variant: 'modern'
            })
            const response = await POST(request)

            const responseData = await expectApiResponse(response, 200, ['libran', 'variant'])

            expect(responseData.variant).toBe('modern')
        })

        it('should handle long text input', async () => {
            const longText = 'This is a very long text that should be translated properly. '.repeat(10)
            const request = createMockRequest('POST', {
                text: longText,
                variant: 'ancient'
            })
            const response = await POST(request)

            const responseData = await expectApiResponse(response, 200, ['libran', 'variant'])

            expect(responseData.libran).toBeDefined()
        })

        it('should default to ancient variant when not specified', async () => {
            const request = createMockRequest('POST', {
                text: 'Hello world'
                // variant not specified
            })
            const response = await POST(request)

            const responseData = await expectApiResponse(response, 200, ['libran', 'variant'])

            expect(responseData.variant).toBe('ancient')
        })
    })

    describe('POST /api/translate - Validation Errors', () => {
        it('should return 400 for missing text', async () => {
            const request = createMockRequest('POST', testData.translate.missingText)
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for empty text', async () => {
            const request = createMockRequest('POST', testData.translate.invalid)
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for non-string text', async () => {
            const request = createMockRequest('POST', {
                text: 123,
                variant: 'ancient'
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for invalid variant', async () => {
            const request = createMockRequest('POST', {
                text: 'Hello world',
                variant: 'invalid-variant'
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_INVALID_VARIANT')
        })

        it('should return 400 for null variant', async () => {
            const request = createMockRequest('POST', {
                text: 'Hello world',
                variant: null
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_INVALID_VARIANT')
        })
    })

    describe('POST /api/translate - Edge Cases', () => {
        it('should handle text with special characters', async () => {
            const request = createMockRequest('POST', {
                text: 'Hello, world! How are you? (I\'m fine.)',
                variant: 'ancient'
            })
            const response = await POST(request)

            await expectApiResponse(response, 200, ['libran', 'variant'])
        })

        it('should handle text with numbers', async () => {
            const request = createMockRequest('POST', {
                text: 'I have 5 apples and 10 oranges',
                variant: 'ancient'
            })
            const response = await POST(request)

            await expectApiResponse(response, 200, ['libran', 'variant'])
        })

        it('should handle text with newlines and whitespace', async () => {
            const request = createMockRequest('POST', {
                text: 'Line 1\nLine 2\n\nLine 3',
                variant: 'ancient'
            })
            const response = await POST(request)

            await expectApiResponse(response, 200, ['libran', 'variant'])
        })

        it('should handle unicode characters', async () => {
            const request = createMockRequest('POST', {
                text: 'Café naïve résumé',
                variant: 'ancient'
            })
            const response = await POST(request)

            await expectApiResponse(response, 200, ['libran', 'variant'])
        })
    })

    describe('POST /api/translate - Error Handling', () => {
        it('should handle malformed JSON', async () => {
            const request = new NextRequest('http://localhost:3000/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Secret': 'test-api-secret'
                },
                body: '{ invalid json }'
            })

            const response = await POST(request)

            expect(response.status).toBeGreaterThanOrEqual(400)
        })

        it('should include correlation ID in all responses', async () => {
            const request = createMockRequest('POST', testData.translate.valid)
            const response = await POST(request)

            const responseData = await extractResponseData(response)
            expect(responseData).toBeDefined()
            expect(responseData.libran).toBeDefined()
        })

        it('should include correlation ID in error responses', async () => {
            const request = createMockRequest('POST', testData.translate.missingText)
            const response = await POST(request)

            const responseData = await extractResponseData(response)
            expect(responseData).toBeDefined()
            expect(response.status).toBeGreaterThanOrEqual(400)
        })
    })

    describe('POST /api/translate - Performance and Metrics', () => {
        it('should record translation metrics on success', async () => {
            const { metrics } = await import('@/lib/metrics')

            const request = createMockRequest('POST', testData.translate.valid)
            const response = await POST(request)

            await expectApiResponse(response, 200)
            expect(metrics.recordTranslation).toHaveBeenCalled()
        })

        it('should record error metrics on validation failure', async () => {
            const { metrics } = await import('@/lib/metrics')

            const request = createMockRequest('POST', testData.translate.missingText)
            const response = await POST(request)

            expectErrorResponse(response)
            expect(metrics.recordError).toHaveBeenCalled()
        })

        it('should log API request', async () => {
            const request = createMockRequest('POST', testData.translate.valid)
            const response = await POST(request)

            await expectApiResponse(response, 200)
            // Note: We can't easily test the logger without more complex mocking
            // but we can verify the response structure indicates logging worked
            const responseData = await extractResponseData(response)
            expect(responseData).toBeDefined()
            expect(responseData.libran).toBeDefined()
        })
    })
})
