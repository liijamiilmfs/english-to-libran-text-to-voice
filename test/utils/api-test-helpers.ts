import { NextRequest } from 'next/server'
import { vi, expect } from 'vitest'

/**
 * Test utilities for API route integration testing
 */

// Mock external dependencies
export const mockExternalDependencies = () => {
    // Mock OpenAI
    vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => ({
            audio: {
                speech: {
                    create: vi.fn().mockResolvedValue({
                        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
                    })
                }
            },
            chat: {
                completions: {
                    create: vi.fn().mockResolvedValue({
                        choices: [
                            {
                                message: {
                                    content: 'Mocked translation result'
                                }
                            }
                        ]
                    })
                }
            }
        }))
    }))

    // Mock metrics
    vi.mock('@/lib/metrics', () => ({
        metrics: {
            recordTranslation: vi.fn(),
            recordVoiceGeneration: vi.fn(),
            recordTTSGeneration: vi.fn(),
            recordError: vi.fn(),
            recordApiCall: vi.fn(),
            recordRequest: vi.fn()
        }
    }))

    // Mock TTS cache
    vi.mock('@/lib/tts-cache', () => ({
        ttsCache: {
            get: vi.fn().mockResolvedValue(null),
            set: vi.fn().mockResolvedValue(undefined),
            has: vi.fn().mockResolvedValue(false),
            generateHash: vi.fn().mockReturnValue('test-hash'),
            getCachedAudio: vi.fn().mockResolvedValue(null),
            storeCachedAudio: vi.fn().mockResolvedValue(undefined)
        }
    }))

    // Mock guardrails
    vi.mock('@/lib/api-guardrails', () => ({
        withGuardrails: vi.fn((handler) => handler)
    }))

    // Mock universal security
    vi.mock('@/lib/universal-security', () => ({
        withUniversalSecurity: vi.fn((handler) => handler)
    }))
}

/**
 * Create a mock NextRequest for testing
 */
export const createMockRequest = (
    method: string = 'POST',
    body?: any,
    searchParams?: Record<string, string>
): NextRequest => {
    const url = new URL('http://localhost:3000/api/test')

    if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
            url.searchParams.set(key, value)
        })
    }

    const request = new NextRequest(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Secret': 'test-api-secret'
        },
        body: body ? JSON.stringify(body) : undefined
    })

    return request
}

/**
 * Create a mock NextResponse for testing
 */
export const createMockResponse = (data: any, status: number = 200) => {
    return {
        json: vi.fn().mockReturnValue({
            status,
            headers: new Headers(),
            body: JSON.stringify(data)
        }),
        status,
        headers: new Headers(),
        body: JSON.stringify(data)
    }
}

/**
 * Test data generators
 */
export const testData = {
    translate: {
        valid: {
            text: 'Hello world',
            variant: 'ancient'
        },
        invalid: {
            text: '',
            variant: 'invalid'
        },
        missingText: {
            variant: 'ancient'
        }
    },
    speak: {
        valid: {
            libranText: 'Mocked Librán text',
            voice: 'alloy',
            format: 'mp3'
        },
        differentVoice: {
            libranText: 'Mocked Librán text',
            voice: 'fable',
            format: 'mp3'
        },
        differentFormat: {
            libranText: 'Mocked Librán text',
            voice: 'alloy',
            format: 'wav'
        },
        missingText: {
            voice: 'alloy',
            format: 'mp3'
        },
        invalidText: {
            libranText: '',
            voice: 'alloy',
            format: 'mp3'
        },
        nonStringText: {
            libranText: 123,
            voice: 'alloy',
            format: 'mp3'
        },
        invalidVoice: {
            libranText: 'Mocked Librán text',
            voice: 'invalid-voice',
            format: 'mp3'
        },
        invalidFormat: {
            libranText: 'Mocked Librán text',
            voice: 'alloy',
            format: 'invalid-format'
        },
        long: {
            libranText: 'This is a very long Librán text that should be spoken properly. '.repeat(10),
            voice: 'alloy',
            format: 'mp3'
        },
        specialChars: {
            libranText: 'Hello, world! How are you? (I\'m fine.)',
            voice: 'alloy',
            format: 'mp3'
        },
        numbers: {
            libranText: '123 test 456',
            voice: 'alloy',
            format: 'mp3'
        },
        unicode: {
            libranText: 'Café naïve résumé',
            voice: 'alloy',
            format: 'mp3'
        },
        malformedJson: '{ "libranText": "Hello world", "voice": "alloy", }' // Malformed JSON
    },
    phrases: {
        valid: {
            action: 'random',
            category: 'greetings',
            limit: '5'
        },
        search: {
            action: 'search',
            search: 'hello'
        },
        invalid: {
            action: 'invalid'
        }
    }
}

/**
 * Helper to extract JSON from NextResponse
 */
export const extractResponseData = async (response: any) => {
    if (response.body && typeof response.body === 'object') {
        // Handle ReadableStream
        const text = await response.text()
        try {
            return JSON.parse(text)
        } catch (error) {
            // If parsing fails, return the raw text (for binary data like audio)
            return text
        }
    }
    // Handle direct JSON string
    try {
        return JSON.parse(response.body)
    } catch (error) {
        // If parsing fails, return the raw body (for binary data)
        return response.body
    }
}

/**
 * Helper to extract binary data from NextResponse (for audio endpoints)
 */
export const extractBinaryResponseData = async (response: any) => {
    if (response.body && typeof response.body === 'object') {
        // Handle ReadableStream
        const arrayBuffer = await response.arrayBuffer()
        return arrayBuffer
    }
    // Handle direct buffer
    return response.body
}

/**
 * Assertion helpers
 */
export const expectApiResponse = async (response: any, expectedStatus: number, expectedKeys?: string[]) => {
    expect(response.status).toBe(expectedStatus)

    if (expectedKeys) {
        const responseData = await extractResponseData(response)
        expectedKeys.forEach(key => {
            expect(responseData).toHaveProperty(key)
        })
        return responseData // Return the parsed data so tests can use it
    }
}

export const expectBinaryResponse = async (response: any, expectedStatus: number, expectedContentType?: string) => {
    expect(response.status).toBe(expectedStatus)

    if (expectedContentType) {
        expect(response.headers.get('content-type')).toContain(expectedContentType)
    }

    const binaryData = await extractBinaryResponseData(response)
    expect(binaryData).toBeInstanceOf(ArrayBuffer)
    expect(binaryData.byteLength).toBeGreaterThan(0)

    return binaryData
}

export const expectErrorResponse = async (response: any, expectedErrorCode?: string) => {
    expect(response.status).toBeGreaterThanOrEqual(400)

    const responseData = await extractResponseData(response)
    expect(responseData).toHaveProperty('error')

    if (expectedErrorCode) {
        expect(responseData).toHaveProperty('code', expectedErrorCode)
    }
}
