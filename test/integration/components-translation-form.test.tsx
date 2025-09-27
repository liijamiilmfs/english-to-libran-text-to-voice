import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the analytics module
vi.mock('@/lib/analytics', () => ({
    trackFeatureUsage: vi.fn(),
    trackUserInteraction: vi.fn(),
    trackError: vi.fn()
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import component after mocking
import TranslationForm from '../../app/components/TranslationForm'

describe('TranslationForm Integration Tests', () => {
    const mockOnTranslation = vi.fn()
    const mockOnLoadingChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockClear()
    })

    describe('Form Rendering', () => {
        it('renders the translation form with all required elements', () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            expect(screen.getByLabelText(/english text/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/ancient librán/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
        })

        it('has correct default values', () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i) as HTMLTextAreaElement
            const ancientRadio = screen.getByLabelText(/ancient librán/i) as HTMLInputElement

            expect(textarea.value).toBe('')
            expect(ancientRadio.checked).toBe(true)
        })
    })

    describe('Form Interactions', () => {
        it('updates input text when user types', () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i) as HTMLTextAreaElement
            fireEvent.change(textarea, { target: { value: 'Hello world' } })

            expect(textarea.value).toBe('Hello world')
        })

        it('changes variant when user selects different option', () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const modernRadio = screen.getByLabelText(/modern librán/i) as HTMLInputElement
            fireEvent.click(modernRadio)

            expect(modernRadio.checked).toBe(true)
        })
    })

    describe('Translation API Integration', () => {
        it('successfully translates text and calls onTranslation callback', async () => {
            const mockResponse = {
                libran: 'Haelo woruld',
                variant: 'ancient',
                confidence: 0.9,
                wordCount: 2
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: 'Hello world',
                        variant: 'ancient'
                    })
                })
            })

            await waitFor(() => {
                expect(mockOnTranslation).toHaveBeenCalledWith(
                    'Haelo woruld',
                    'ancient',
                    'Hello world',
                    {
                        confidence: 0.9,
                        wordCount: 2
                    }
                )
            })

            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
            expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
        })

        it('handles translation with modern variant', async () => {
            const mockResponse = {
                libran: 'Modern translation',
                variant: 'modern',
                confidence: 0.8,
                wordCount: 3
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const modernRadio = screen.getByLabelText(/modern librán/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Test text' } })
            fireEvent.click(modernRadio)
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: 'Test text',
                        variant: 'modern'
                    })
                })
            })

            await waitFor(() => {
                expect(mockOnTranslation).toHaveBeenCalledWith(
                    'Modern translation',
                    'modern',
                    'Test text',
                    {
                        confidence: 0.8,
                        wordCount: 3
                    }
                )
            })
        })

        it('handles long text input', async () => {
            const longText = 'This is a very long text that should be translated properly. '.repeat(10)
            const mockResponse = {
                libran: 'Translated long text',
                variant: 'ancient',
                confidence: 0.7,
                wordCount: 50
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: longText } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: longText,
                        variant: 'ancient'
                    })
                })
            })

            await waitFor(() => {
                expect(mockOnTranslation).toHaveBeenCalledWith(
                    'Translated long text',
                    'ancient',
                    longText,
                    {
                        confidence: 0.7,
                        wordCount: 50
                    }
                )
            })
        })
    })

    describe('Error Handling', () => {
        it('handles API errors gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
                expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
            })

            // Should not call onTranslation on error
            expect(mockOnTranslation).not.toHaveBeenCalled()
        })

        it('handles non-200 HTTP responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Invalid input' })
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
                expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
            })

            expect(mockOnTranslation).not.toHaveBeenCalled()
        })

        it('handles malformed JSON responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON') }
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
                expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
            })

            expect(mockOnTranslation).not.toHaveBeenCalled()
        })
    })

    describe('Validation', () => {
        it('prevents submission with empty text', async () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const translateButton = screen.getByRole('button', { name: /translate/i })
            fireEvent.click(translateButton)

            // Should not make API call
            expect(mockFetch).not.toHaveBeenCalled()
            expect(mockOnTranslation).not.toHaveBeenCalled()
            expect(mockOnLoadingChange).not.toHaveBeenCalled()
        })

        it('prevents submission with whitespace-only text', async () => {
            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: '   \n  \t  ' } })
            fireEvent.click(translateButton)

            // Should not make API call
            expect(mockFetch).not.toHaveBeenCalled()
            expect(mockOnTranslation).not.toHaveBeenCalled()
            expect(mockOnLoadingChange).not.toHaveBeenCalled()
        })

        it('allows submission with text containing only whitespace but with content', async () => {
            const mockResponse = {
                libran: 'Translated text',
                variant: 'ancient',
                confidence: 0.9,
                wordCount: 2
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: '  Hello  ' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: '  Hello  ',
                        variant: 'ancient'
                    })
                })
            })
        })
    })

    describe('Loading States', () => {
        it('shows loading state during translation', async () => {
            // Mock a delayed response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        ok: true,
                        json: async () => ({
                            libran: 'Translated text',
                            variant: 'ancient',
                            confidence: 0.9,
                            wordCount: 2
                        })
                    }), 100)
                )
            )

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            // Should call loading change immediately
            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)

            await waitFor(() => {
                expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
            })
        })

        it('disables form during translation', async () => {
            // Mock a delayed response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        ok: true,
                        json: async () => ({
                            libran: 'Translated text',
                            variant: 'ancient',
                            confidence: 0.9,
                            wordCount: 2
                        })
                    }), 100)
                )
            )

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            // During loading, the button should be disabled
            await waitFor(() => {
                expect(translateButton).toBeDisabled()
            })

            // After loading completes, button should be enabled again
            await waitFor(() => {
                expect(translateButton).not.toBeDisabled()
            }, { timeout: 200 })
        })
    })

    describe('Analytics Integration', () => {
        it.skip('tracks successful translations', async () => {
            // TODO: Fix analytics mock setup
            const { trackFeatureUsage, trackUserInteraction } = await import('@/lib/analytics')

            const mockResponse = {
                libran: 'Haelo woruld',
                variant: 'ancient',
                confidence: 0.9,
                wordCount: 2
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            })

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const textarea = screen.getByLabelText(/english text/i)
            const translateButton = screen.getByRole('button', { name: /translate/i })

            fireEvent.change(textarea, { target: { value: 'Hello world' } })
            fireEvent.click(translateButton)

            await waitFor(() => {
                expect(trackFeatureUsage).toHaveBeenCalledWith('translation', 'start', {
                    text_length: 11,
                    variant: 'ancient'
                })
            })

            await waitFor(() => {
                expect(trackUserInteraction).toHaveBeenCalledWith('form_submit', 'translation_form', {
                    success: true,
                    text_length: 11,
                    variant: 'ancient',
                    confidence: 0.9,
                    word_count: 2
                })
            })
        })

        it.skip('tracks failed form submissions', async () => {
            // TODO: Fix analytics mock setup
            const { trackUserInteraction } = await import('@/lib/analytics')

            render(<TranslationForm onTranslation={mockOnTranslation} onLoadingChange={mockOnLoadingChange} />)

            const translateButton = screen.getByRole('button', { name: /translate/i })
            fireEvent.click(translateButton)

            expect(trackUserInteraction).toHaveBeenCalledWith('form_submit', 'translation_form', {
                success: false,
                reason: 'empty_text'
            })
        })
    })
})
