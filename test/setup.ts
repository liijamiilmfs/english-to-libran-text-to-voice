import { vi } from 'vitest'

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.ELEVENLABS_API_KEY = 'test-elevenlabs-key'
process.env.NEXTAUTH_SECRET = 'test-nextauth-secret'
process.env.GITHUB_ID = 'test-github-id'
process.env.GITHUB_SECRET = 'test-github-secret'
process.env.ADMIN_SECRET = 'test-admin-secret'
process.env.API_SECRET = 'test-api-secret'

// Mock fetch globally
global.fetch = vi.fn()

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock performance API
global.performance = {
  now: vi.fn(() => Date.now())
} as any
