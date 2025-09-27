import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    createMockRequest,
    expectBinaryResponse,
    expectErrorResponse,
    extractResponseData,
    mockExternalDependencies,
    testData
} from '../utils/api-test-helpers'

// Mock external dependencies before importing the handler
mockExternalDependencies()

// Import the handler after mocking
import { POST } from '../../app/api/speak/route'

describe('/api/speak Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/speak - Success Cases', () => {
        it('should generate speech successfully with default voice', async () => {
            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200, 'audio/mpeg')

            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
            expect(response.headers.get('content-disposition')).toContain('libran-audio.mp3')
        })

        it('should generate speech with different voice', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'nova',
                format: 'mp3'
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200, 'audio/mpeg')

            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should generate speech with different format', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'alloy',
                format: 'wav'
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200, 'audio/wav')

            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
            expect(response.headers.get('content-disposition')).toContain('libran-audio.wav')
        })

        it('should use environment default voice when not specified', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text'
                // voice not specified
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)

            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should use environment default format when not specified', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'alloy'
                // format not specified
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)

            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })
    })

    describe('POST /api/speak - Validation Errors', () => {
        it('should return 400 for missing libranText', async () => {
            const request = createMockRequest('POST', testData.speak.missingText)
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for empty libranText', async () => {
            const request = createMockRequest('POST', testData.speak.invalidText)
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for non-string libranText', async () => {
            const request = createMockRequest('POST', {
                libranText: 123,
                voice: 'alloy'
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_MISSING_TEXT')
        })

        it('should return 400 for invalid voice', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'invalid-voice'
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_INVALID_VOICE')
        })

        it('should return 400 for invalid format', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'alloy',
                format: 'invalid-format'
            })
            const response = await POST(request)

            await expectErrorResponse(response, 'VALIDATION_INVALID_FORMAT')
        })
    })

    describe('POST /api/speak - Edge Cases', () => {
        it('should handle long text input', async () => {
            const longText = 'This is a very long Librán text that should be spoken properly. '.repeat(20)
            const request = createMockRequest('POST', {
                libranText: longText,
                voice: 'alloy',
                format: 'mp3'
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should handle text with special characters', async () => {
            const request = createMockRequest('POST', testData.speak.specialChars)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should handle text with numbers', async () => {
            const request = createMockRequest('POST', testData.speak.numbers)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should handle unicode characters', async () => {
            const request = createMockRequest('POST', testData.speak.unicode)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })
    })

    describe('POST /api/speak - Caching', () => {
        it('should check cache before generating speech', async () => {
            const { ttsCache } = await import('@/lib/tts-cache')

            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            await expectBinaryResponse(response, 200)
            expect(ttsCache.getCachedAudio).toHaveBeenCalledWith('test-hash')
        })

        it('should store result in cache after generation', async () => {
            const { ttsCache } = await import('@/lib/tts-cache')

            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            await expectBinaryResponse(response, 200)
            expect(ttsCache.storeCachedAudio).toHaveBeenCalledWith(
                'test-hash',
                'Mocked Librán text',
                'alloy',
                'mp3',
                'gpt-4o-mini-tts',
                expect.any(Buffer),
                expect.any(Number)
            )
        })
    })

    describe('POST /api/speak - Error Handling', () => {
        it('should handle malformed JSON', async () => {
            const request = new NextRequest('http://localhost:3000/api/speak', {
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
            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should include correlation ID in error responses', async () => {
            const request = createMockRequest('POST', testData.speak.missingText)
            const response = await POST(request)

            const responseData = await extractResponseData(response)
            expect(responseData).toBeDefined()
            expect(response.status).toBeGreaterThanOrEqual(400)
        })
    })

    describe('POST /api/speak - Performance and Metrics', () => {
        it('should record voice generation metrics on success', async () => {
            const { metrics } = await import('@/lib/metrics')

            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            await expectBinaryResponse(response, 200)
            expect(metrics.recordTTSGeneration).toHaveBeenCalledWith(expect.any(Number)) // audioDuration
        })

        it('should record error metrics on validation failure', async () => {
            const { metrics } = await import('@/lib/metrics')

            const request = createMockRequest('POST', testData.speak.missingText)
            const response = await POST(request)

            await expectErrorResponse(response)
            expect(metrics.recordError).toHaveBeenCalled()
        })

        it('should log API request', async () => {
            const request = createMockRequest('POST', testData.speak.valid)
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })
    })

    describe('POST /api/speak - Voice Selection', () => {
        it('should handle voice characteristics', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'alloy',
                characteristics: {
                    age: 'adult',
                    gender: 'neutral',
                    accent: 'american'
                }
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })

        it('should validate voice characteristics', async () => {
            const request = createMockRequest('POST', {
                libranText: 'Mocked Librán text',
                voice: 'alloy',
                characteristics: {
                    age: 'invalid-age',
                    gender: 'invalid-gender'
                }
            })
            const response = await POST(request)

            const audioData = await expectBinaryResponse(response, 200)
            expect(audioData).toBeInstanceOf(ArrayBuffer)
            expect(audioData.byteLength).toBeGreaterThan(0)
        })
    })
})
