'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import UserProfile from '../components/auth/UserProfile'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              User Profile
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your preferences and account settings
            </p>
          </div>

          <div className="flex justify-center">
            <UserProfile />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
