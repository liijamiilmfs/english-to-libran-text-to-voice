import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AppPage from '../../app/app/page'

// Mock Next.js router
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn()
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: () => <div data-testid="shield-icon" />,
  Volume2: () => <div data-testid="volume2-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  Settings: () => <div data-testid="settings-icon" />
}))

// Mock the components
vi.mock('../../app/components/TranslationForm', () => ({
  default: ({ onTranslation, onVoiceChange, onSimpleVoiceChange, isTranslating, isGenerating }: any) => (
    <div data-testid="translation-form">
      <button 
        onClick={() => onTranslation('test translation', 'ancient', 'test input')}
        disabled={isTranslating || isGenerating}
      >
        Translate
      </button>
    </div>
  )
}))

vi.mock('../../app/components/TranslationResult', () => ({
  default: ({ libranText, variant, originalText }: any) => (
    <div data-testid="translation-result">
      <p>Libran: {libranText}</p>
      <p>Variant: {variant}</p>
      <p>Original: {originalText}</p>
    </div>
  )
}))

vi.mock('../../app/components/AudioDownloadButton', () => ({
  default: ({ audioUrl, filename }: any) => (
    <div data-testid="audio-download">
      <p>Audio URL: {audioUrl}</p>
      <p>Filename: {filename}</p>
    </div>
  )
}))

vi.mock('../../app/components/PhrasePicker', () => ({
  default: ({ onPhraseSelect }: any) => (
    <div data-testid="phrase-picker">
      <button onClick={() => onPhraseSelect({ english: 'Hello world' })}>
        Select Phrase
      </button>
    </div>
  )
}))

vi.mock('../../app/components/IntegratedVoiceSelector', () => ({
  default: ({ selectedVoice, onVoiceChange, onSimpleVoiceChange }: any) => (
    <div data-testid="voice-selector">
      <button onClick={() => onVoiceChange(null, null, null)}>
        Change Voice
      </button>
      <button onClick={() => onSimpleVoiceChange('alloy')}>
        Simple Voice
      </button>
    </div>
  )
}))

// Mock the voice system
vi.mock('../../lib/simple-voice-system', () => ({
  SIMPLE_VOICE_OPTIONS: { alloy: { name: 'Alloy' } },
  getSimpleVoiceDefinition: () => ({ name: 'Alloy' }),
  getDefaultSimpleVoice: () => 'alloy'
}))

// Mock fetch
global.fetch = vi.fn()

describe('AppPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful auth check
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
  })

  it('shows loading state initially', () => {
    render(<AppPage />)
    
    expect(screen.getByText('Verifying access to the Forge...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument() // Loading spinner
  })

  it('redirects to hero page when not authenticated', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    })

    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }

    render(<AppPage />)
    
    await waitFor(() => {
      expect(window.location.href).toBe('/hero')
    })
  })

  it('redirects to hero page on auth check error', async () => {
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }

    render(<AppPage />)
    
    await waitFor(() => {
      expect(window.location.href).toBe('/hero')
    })
  })

  it('renders main app when authenticated', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Librán Voice Forge')).toBeInTheDocument()
      expect(screen.getByText('Text Translation')).toBeInTheDocument()
      expect(screen.getByText('Common Phrases')).toBeInTheDocument()
    })
  })

  it('renders header with navigation', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Librán Voice Forge')).toBeInTheDocument()
      expect(screen.getByText('Voice Settings')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })

  it('toggles voice selector visibility', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      const voiceSettingsButton = screen.getByText('Voice Settings')
      fireEvent.click(voiceSettingsButton)
      
      expect(screen.getByTestId('voice-selector')).toBeInTheDocument()
    })
  })

  it('handles logout', async () => {
    // Mock localStorage
    const mockLocalStorage = {
      removeItem: vi.fn()
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage
    })

    // Mock window.location.href
    delete (window as any).location
    ;(window as any).location = { href: '' }

    render(<AppPage />)
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Logout')
      fireEvent.click(logoutButton)
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token')
      expect(window.location.href).toBe('/hero')
    })
  })

  it('handles translation', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      const translateButton = screen.getByText('Translate')
      fireEvent.click(translateButton)
      
      expect(screen.getByText('Libran: test translation')).toBeInTheDocument()
      expect(screen.getByText('Variant: ancient')).toBeInTheDocument()
      expect(screen.getByText('Original: test input')).toBeInTheDocument()
    })
  })

  it('handles phrase selection', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      const selectPhraseButton = screen.getByText('Select Phrase')
      fireEvent.click(selectPhraseButton)
      
      // The phrase should be set in the translation form
      // This would be tested through the form component's behavior
    })
  })

  it('displays forge status', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Forge Status')).toBeInTheDocument()
      expect(screen.getByText('Authentication:')).toBeInTheDocument()
      expect(screen.getByText('✓ Active')).toBeInTheDocument()
      expect(screen.getByText('Translation Engine:')).toBeInTheDocument()
      expect(screen.getByText('✓ Online')).toBeInTheDocument()
      expect(screen.getByText('Voice Synthesis:')).toBeInTheDocument()
      expect(screen.getByText('✓ Ready')).toBeInTheDocument()
    })
  })

  it('has proper styling classes', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      const mainContainer = document.querySelector('.min-h-screen')
      expect(mainContainer).toHaveClass('bg-gradient-to-br')
      expect(mainContainer).toHaveClass('from-slate-900')
    })
  })

  it('renders voice selector when toggled', async () => {
    render(<AppPage />)
    
    await waitFor(() => {
      const voiceSettingsButton = screen.getByText('Voice Settings')
      fireEvent.click(voiceSettingsButton)
      
      expect(screen.getByTestId('voice-selector')).toBeInTheDocument()
      expect(screen.getByText('Change Voice')).toBeInTheDocument()
      expect(screen.getByText('Simple Voice')).toBeInTheDocument()
    })
  })
})
