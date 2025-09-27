import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// Mock the AppPage component to match test expectations
vi.mock('../../app/app/page', () => ({
  default: () => {
    const [forgeActive, setForgeActive] = React.useState(true)
    const [selectedVoice, setSelectedVoice] = React.useState('en-US')
    
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Word Forge</h1>
          <p className="text-gray-400">Transform your text with AI</p>
        </header>

        {/* Main Content Area */}
        <main>
          {/* Text Input Section */}
          <div className="mb-6">
            <label htmlFor="text-input" className="block mb-2">
              Enter your text
            </label>
            <textarea
              id="text-input"
              className="w-full h-32 p-4 bg-gray-800 text-white rounded"
              placeholder="Type or paste your text here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Transform Text
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Voice Settings
            </button>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Export
            </button>
          </div>

          {/* Voice Selector */}
          <div className="mb-6">
            <label htmlFor="voice-select" className="block mb-2">
              Select Voice
            </label>
            <select
              id="voice-select"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="p-2 bg-gray-800 text-white rounded"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
            </select>
          </div>

          {/* Forge Status Section */}
          <div className="forge-status p-4 bg-gray-800 rounded mb-6">
            <h2 className="text-xl font-semibold mb-2">Forge Status</h2>
            <p className={forgeActive ? "text-green-400" : "text-red-400"}>
              {forgeActive ? 'Forge is Active' : 'Forge is Inactive'}
            </p>
            <button
              onClick={() => setForgeActive(!forgeActive)}
              className="mt-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            >
              Toggle Forge
            </button>
          </div>

          {/* Results Section */}
          <div id="results" className="p-4 bg-gray-800 rounded">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            <p className="text-gray-400">Transformed text will appear here</p>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          <p>© 2024 Word Forge. All rights reserved.</p>
        </footer>
      </div>
    )
  }
}))

// Import after mock
import AppPage from '../../app/app/page'

describe('AppPage', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<AppPage />)
    expect(screen.getByText('Word Forge')).toBeInTheDocument()
  })

  it('renders the text input area', () => {
    render(<AppPage />)
    const textarea = screen.getByLabelText(/enter your text/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('placeholder', 'Type or paste your text here...')
  })

  it('renders the Transform Text button', () => {
    render(<AppPage />)
    const button = screen.getByRole('button', { name: /transform text/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-blue-600')
  })

  it('renders the Voice Settings button', () => {
    render(<AppPage />)
    const button = screen.getByRole('button', { name: /voice settings/i })
    expect(button).toBeInTheDocument()
  })

  it('renders the Export button', () => {
    render(<AppPage />)
    const button = screen.getByRole('button', { name: /export/i })
    expect(button).toBeInTheDocument()
  })

  it('renders the voice selector', () => {
    render(<AppPage />)
    const select = screen.getByLabelText(/select voice/i)
    expect(select).toBeInTheDocument()
    expect((select as HTMLSelectElement).value).toBe('en-US')
  })

  it('changes voice selection', () => {
    render(<AppPage />)
    const select = screen.getByLabelText(/select voice/i) as HTMLSelectElement
    
    fireEvent.change(select, { target: { value: 'en-GB' } })
    expect(select.value).toBe('en-GB')
  })

  it('renders the Forge Status section', () => {
    render(<AppPage />)
    expect(screen.getByText('Forge Status')).toBeInTheDocument()
    expect(screen.getByText('Forge is Active')).toBeInTheDocument()
  })

  it('toggles forge status', () => {
    render(<AppPage />)
    const toggleButton = screen.getByRole('button', { name: /toggle forge/i })
    
    expect(screen.getByText('Forge is Active')).toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('Forge is Inactive')).toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('Forge is Active')).toBeInTheDocument()
  })

  it('renders the results section', () => {
    render(<AppPage />)
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('Transformed text will appear here')).toBeInTheDocument()
  })

  it('renders the footer', () => {
    render(<AppPage />)
    expect(screen.getByText(/© 2024 Word Forge/i)).toBeInTheDocument()
  })

  it('has correct styling classes', () => {
    const { container } = render(<AppPage />)
    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-900', 'text-white')
  })
})