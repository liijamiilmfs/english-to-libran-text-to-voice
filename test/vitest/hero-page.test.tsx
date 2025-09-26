import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroPage from '../../app/hero/page'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => children
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Sword: () => <div data-testid="sword-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Crown: () => <div data-testid="crown-icon" />,
  Mountain: () => <div data-testid="mountain-icon" />,
  Wind: () => <div data-testid="wind-icon" />,
  Flame: () => <div data-testid="flame-icon" />,
  Cog: () => <div data-testid="cog-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Play: () => <div data-testid="play-icon" />,
  Volume2: () => <div data-testid="volume2-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />
}))

describe('HeroPage', () => {
  it('renders the main title', () => {
    render(<HeroPage />)
    
    // Check for scene titles (they rotate, so we check for any of them)
    const titles = [
      'The Forge of Words',
      'The Voice of Thunder', 
      'The Bridge of Ages'
    ]
    
    const titleElement = titles.find(title => 
      screen.queryByText(title)
    )
    
    expect(titleElement).toBeTruthy()
  })

  it('renders action buttons', () => {
    render(<HeroPage />)
    
    expect(screen.getByText('Enter the Forge')).toBeInTheDocument()
    expect(screen.getByText('Hear the Voices')).toBeInTheDocument()
  })

  it('renders scene indicators', () => {
    render(<HeroPage />)
    
    // Should have 3 scene indicators (dots)
    const indicators = screen.getAllByRole('button').filter((button: any) => 
      button.className.includes('rounded-full')
    )
    
    expect(indicators).toHaveLength(3)
  })

  it('has proper styling classes', () => {
    render(<HeroPage />)
    
    const mainContainer = screen.getByRole('main') || document.querySelector('.min-h-screen')
    expect(mainContainer).toHaveClass('min-h-screen')
    expect(mainContainer).toHaveClass('bg-gradient-to-br')
  })

  it('renders floating icons', () => {
    render(<HeroPage />)
    
    // Check for various icon types that should be present
    expect(screen.getAllByTestId('cog-icon').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('wind-icon').length).toBeGreaterThan(0)
  })

  it('displays Norse runes', () => {
    render(<HeroPage />)
    
    // Check for Norse runes in the floating elements
    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']
    const foundRunes = runes.filter(rune => screen.queryByText(rune))
    
    expect(foundRunes.length).toBeGreaterThan(0)
  })

  it('has steampunk and Norse mythology theme elements', () => {
    render(<HeroPage />)
    
    // Check for steampunk elements (gears, cogs)
    expect(screen.getAllByTestId('cog-icon').length).toBeGreaterThan(0)
    
    // Check for Norse mythology elements (runes, shields, swords)
    expect(screen.getAllByTestId('shield-icon').length).toBeGreaterThan(0)
    expect(screen.getAllByTestId('sword-icon').length).toBeGreaterThan(0)
  })

  it('renders particle effects container', () => {
    render(<HeroPage />)
    
    // Check for particle effects container
    const particleContainer = document.querySelector('.absolute.inset-0.pointer-events-none')
    expect(particleContainer).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<HeroPage />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button: any) => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('displays scroll indicator', () => {
    render(<HeroPage />)
    
    expect(screen.getByTestId('chevron-right-icon')).toBeInTheDocument()
  })
})
