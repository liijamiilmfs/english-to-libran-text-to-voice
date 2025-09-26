'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import LoginButton from './LoginButton'

interface UserPreferences {
  userId: string
  voiceSettings?: {
    preferredVoice?: string
    voiceSpeed?: number
    voicePitch?: number
  }
  translationSettings?: {
    preferredAccent?: string
    autoTranslate?: boolean
  }
  uiSettings?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
  }
  createdAt: string
  updatedAt: string
}

export default function UserProfile() {
  const { data: session, status } = useSession()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (session) {
      fetchPreferences()
    }
  }, [session])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/preferences')
      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (updatedPrefs: Partial<UserPreferences>) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPrefs)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPreferences(data.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!session) {
    return <LoginButton />
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <div className="flex items-center space-x-4 mb-4">
        {session.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-12 w-12 rounded-full"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {session.user?.name || 'User'}
          </h3>
          <p className="text-sm text-gray-600">
            {session.user?.email}
          </p>
        </div>
      </div>

      {preferences && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Preferences</h4>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Voice
                </label>
                <select
                  value={preferences.voiceSettings?.preferredVoice || 'alloy'}
                  onChange={(e) => {
                    const newPrefs = {
                      ...preferences,
                      voiceSettings: {
                        ...preferences.voiceSettings,
                        preferredVoice: e.target.value
                      }
                    }
                    setPreferences(newPrefs)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="alloy">Alloy</option>
                  <option value="echo">Echo</option>
                  <option value="fable">Fable</option>
                  <option value="onyx">Onyx</option>
                  <option value="nova">Nova</option>
                  <option value="shimmer">Shimmer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Voice Speed
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={preferences.voiceSettings?.voiceSpeed || 1.0}
                  onChange={(e) => {
                    const newPrefs = {
                      ...preferences,
                      voiceSettings: {
                        ...preferences.voiceSettings,
                        voiceSpeed: parseFloat(e.target.value)
                      }
                    }
                    setPreferences(newPrefs)
                  }}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  {preferences.voiceSettings?.voiceSpeed || 1.0}x
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={preferences.uiSettings?.theme || 'auto'}
                  onChange={(e) => {
                    const newPrefs = {
                      ...preferences,
                      uiSettings: {
                        ...preferences.uiSettings,
                        theme: e.target.value as 'light' | 'dark' | 'auto'
                      }
                    }
                    setPreferences(newPrefs)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => updatePreferences(preferences)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Voice:</span> {preferences.voiceSettings?.preferredVoice || 'alloy'}
              </div>
              <div>
                <span className="font-medium">Speed:</span> {preferences.voiceSettings?.voiceSpeed || 1.0}x
              </div>
              <div>
                <span className="font-medium">Theme:</span> {preferences.uiSettings?.theme || 'auto'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
