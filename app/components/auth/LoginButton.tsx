'use client'

import { trackAuth, trackUserInteraction, trackError } from '@/lib/analytics'
import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { useState } from 'react'

interface LoginButtonProps {
  className?: string
  showUserInfo?: boolean
}

export default function LoginButton({ className = '', showUserInfo = false }: LoginButtonProps) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      trackUserInteraction('click', 'sign_in_button', { provider: 'github' })
      await signIn('github', { callbackUrl: '/' })
      trackAuth('sign_in', 'github')
    } catch (error) {
      console.error('Sign in error:', error)
      trackError('sign_in_failed', error instanceof Error ? error.message : 'Unknown error', { provider: 'github' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      trackUserInteraction('click', 'sign_out_button')
      await signOut({ callbackUrl: '/' })
      trackAuth('sign_out')
    } catch (error) {
      console.error('Sign out error:', error)
      trackError('sign_out_failed', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (session) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {showUserInfo && session.user && (
          <div className="flex items-center space-x-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm text-gray-700">
              {session.user.name || session.user.email}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 ${className}`}
    >
      {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
    </button>
  )
}
