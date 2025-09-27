import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PhrasePicker from '../../app/components/PhrasePicker'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('PhrasePicker Integration Tests', () => {
    const mockOnPhraseSelect = vi.fn()
    const mockOnLoadingChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockClear()
    })

    describe('Component Rendering', () => {
        it('renders phrase picker with all required elements', () => {
            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            expect(screen.getByText(/phrase picker/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /load phrases/i })).toBeInTheDocument()
            expect(screen.getByLabelText(/variant/i)).toBeInTheDocument()
        })

        it('has correct default values', () => {
            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const variantSelect = screen.getByLabelText(/variant/i) as HTMLSelectElement
            expect(variantSelect.value).toBe('ancient')
        })
    })

    describe('Categories Loading', () => {
        it('loads categories successfully', async () => {
            const mockCategories = ['greetings', 'farewells', 'numbers']

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockCategories
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=categories')
            })

            await waitFor(() => {
                mockCategories.forEach(category => {
                    expect(screen.getByText(category)).toBeInTheDocument()
                })
            })
        })

        it('handles categories loading error gracefully', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=categories')
            })

            // Should not crash and should still show the interface
            expect(screen.getByText(/phrase picker/i)).toBeInTheDocument()
        })
    })

    describe('Phrases Loading', () => {
        it('loads phrases successfully with default filters', async () => {
            const mockPhrases = [
                { id: '1', english: 'Hello', libran: 'Haelo', category: 'greetings', difficulty: 'beginner' },
                { id: '2', english: 'Goodbye', libran: 'Godby', category: 'farewells', difficulty: 'beginner' }
            ]

            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings', 'farewells']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPhrases
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=list')
            })

            await waitFor(() => {
                mockPhrases.forEach(phrase => {
                    expect(screen.getByText(phrase.english)).toBeInTheDocument()
                    expect(screen.getByText(phrase.libran)).toBeInTheDocument()
                })
            })

            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
            expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
        })

        it('loads phrases with category filter', async () => {
            const mockPhrases = [
                { id: '1', english: 'Hello', libran: 'Haelo', category: 'greetings', difficulty: 'beginner' }
            ]

            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings', 'farewells']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPhrases
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // Wait for categories to load, then select a category
            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const categorySelect = screen.getByLabelText(/category/i)
            fireEvent.change(categorySelect, { target: { value: 'greetings' } })

            const loadPhrasesButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadPhrasesButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=list&category=greetings')
            })
        })

        it('loads phrases with difficulty filter', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: []
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // Wait for categories to load, then select a difficulty
            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const difficultySelect = screen.getByLabelText(/difficulty/i)
            fireEvent.change(difficultySelect, { target: { value: 'intermediate' } })

            const loadPhrasesButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadPhrasesButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=list&difficulty=intermediate')
            })
        })

        it('loads phrases with search filter', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: []
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // Wait for categories to load, then enter search term
            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const searchInput = screen.getByLabelText(/search/i)
            fireEvent.change(searchInput, { target: { value: 'hello' } })

            const loadPhrasesButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadPhrasesButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=list&search=hello')
            })
        })

        it('loads phrases with combined filters', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: []
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // Wait for categories to load, then apply multiple filters
            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const categorySelect = screen.getByLabelText(/category/i)
            const difficultySelect = screen.getByLabelText(/difficulty/i)
            const searchInput = screen.getByLabelText(/search/i)

            fireEvent.change(categorySelect, { target: { value: 'greetings' } })
            fireEvent.change(difficultySelect, { target: { value: 'beginner' } })
            fireEvent.change(searchInput, { target: { value: 'hello' } })

            const loadPhrasesButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadPhrasesButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=list&category=greetings&difficulty=beginner&search=hello')
            })
        })
    })

    describe('Phrase Selection', () => {
        it('selects a phrase and calls onPhraseSelect callback', async () => {
            const mockPhrases = [
                { id: '1', english: 'Hello', libran: 'Haelo', category: 'greetings', difficulty: 'beginner' }
            ]

            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPhrases
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(screen.getByText('Hello')).toBeInTheDocument()
            })

            const phraseButton = screen.getByRole('button', { name: /hello/i })
            fireEvent.click(phraseButton)

            expect(mockOnPhraseSelect).toHaveBeenCalledWith(mockPhrases[0], 'ancient')
        })

        it('updates phrase selection when variant changes', async () => {
            const mockPhrases = [
                { id: '1', english: 'Hello', libran: 'Haelo', category: 'greetings', difficulty: 'beginner' }
            ]

            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPhrases
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(screen.getByText('Hello')).toBeInTheDocument()
            })

            const phraseButton = screen.getByRole('button', { name: /hello/i })
            fireEvent.click(phraseButton)

            // Change variant
            const variantSelect = screen.getByLabelText(/variant/i)
            fireEvent.change(variantSelect, { target: { value: 'modern' } })

            // Should call onPhraseSelect again with new variant
            expect(mockOnPhraseSelect).toHaveBeenCalledWith(mockPhrases[0], 'modern')
        })

        it('clears phrase selection when new phrase is selected', async () => {
            const mockPhrases = [
                { id: '1', english: 'Hello', libran: 'Haelo', category: 'greetings', difficulty: 'beginner' },
                { id: '2', english: 'Goodbye', libran: 'Godby', category: 'farewells', difficulty: 'beginner' }
            ]

            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings', 'farewells']
                })
            })

            // Mock phrases response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPhrases
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(screen.getByText('Hello')).toBeInTheDocument()
                expect(screen.getByText('Goodbye')).toBeInTheDocument()
            })

            // Select first phrase
            const helloButton = screen.getByRole('button', { name: /hello/i })
            fireEvent.click(helloButton)

            expect(mockOnPhraseSelect).toHaveBeenCalledWith(mockPhrases[0], 'ancient')

            // Select second phrase
            const goodbyeButton = screen.getByRole('button', { name: /goodbye/i })
            fireEvent.click(goodbyeButton)

            expect(mockOnPhraseSelect).toHaveBeenCalledWith(mockPhrases[1], 'ancient')
        })
    })

    describe('Error Handling', () => {
        it('handles phrases loading error gracefully', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases error response
            mockFetch.mockRejectedValueOnce(new Error('Network error'))

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=categories')
            })

            // Should still show the interface even after error
            expect(screen.getByText(/phrase picker/i)).toBeInTheDocument()
            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
            expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
        })

        it('handles non-200 HTTP responses gracefully', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            // Mock phrases error response
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Invalid request' })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/phrases?action=categories')
            })

            // Should still show the interface even after error
            expect(screen.getByText(/phrase picker/i)).toBeInTheDocument()
            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)
            expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Loading States', () => {
        it('shows loading state during phrases loading', async () => {
            // Mock a delayed response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        ok: true,
                        json: async () => ({
                            success: true,
                            data: ['greetings']
                        })
                    }), 100)
                )
            )

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // Should call loading change immediately
            expect(mockOnLoadingChange).toHaveBeenCalledWith(true)

            await waitFor(() => {
                expect(mockOnLoadingChange).toHaveBeenCalledWith(false)
            })
        })

        it('disables load button during loading', async () => {
            // Mock a delayed response
            mockFetch.mockImplementationOnce(() =>
                new Promise(resolve =>
                    setTimeout(() => resolve({
                        ok: true,
                        json: async () => ({
                            success: true,
                            data: ['greetings']
                        })
                    }), 100)
                )
            )

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            // During loading, the button should be disabled
            await waitFor(() => {
                expect(loadButton).toBeDisabled()
            })

            // After loading completes, button should be enabled again
            await waitFor(() => {
                expect(loadButton).not.toBeDisabled()
            }, { timeout: 200 })
        })
    })

    describe('Filter Interactions', () => {
        it('clears search when clear button is clicked', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const searchInput = screen.getByLabelText(/search/i) as HTMLInputElement
            fireEvent.change(searchInput, { target: { value: 'hello' } })

            expect(searchInput.value).toBe('hello')

            const clearButton = screen.getByRole('button', { name: /clear/i })
            fireEvent.click(clearButton)

            expect(searchInput.value).toBe('')
        })

        it('resets all filters when reset button is clicked', async () => {
            // Mock categories response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: ['greetings']
                })
            })

            render(<PhrasePicker onPhraseSelect={mockOnPhraseSelect} onLoadingChange={mockOnLoadingChange} />)

            const loadButton = screen.getByRole('button', { name: /load phrases/i })
            fireEvent.click(loadButton)

            await waitFor(() => {
                expect(screen.getByText('greetings')).toBeInTheDocument()
            })

            const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement
            const difficultySelect = screen.getByLabelText(/difficulty/i) as HTMLSelectElement
            const searchInput = screen.getByLabelText(/search/i) as HTMLInputElement

            fireEvent.change(categorySelect, { target: { value: 'greetings' } })
            fireEvent.change(difficultySelect, { target: { value: 'intermediate' } })
            fireEvent.change(searchInput, { target: { value: 'hello' } })

            expect(categorySelect.value).toBe('greetings')
            expect(difficultySelect.value).toBe('intermediate')
            expect(searchInput.value).toBe('hello')

            const resetButton = screen.getByRole('button', { name: /reset/i })
            fireEvent.click(resetButton)

            expect(categorySelect.value).toBe('')
            expect(difficultySelect.value).toBe('')
            expect(searchInput.value).toBe('')
        })
    })
})
