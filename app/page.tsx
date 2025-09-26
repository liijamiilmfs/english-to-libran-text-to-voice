'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Lock, Zap } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check for authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            'X-API-Secret': process.env.NEXT_PUBLIC_API_SECRET || 'dev-api-secret-change-in-production'
          }
        })
        
        if (response.ok) {
          // User is authenticated, redirect to main app
          router.push('/app')
        } else {
          // User is not authenticated, redirect to hero page
          router.push('/hero')
        }
      } catch (error) {
        // Error checking auth, redirect to hero page
        router.push('/hero')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-orange-900 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Shield className="w-16 h-16 text-amber-400 mx-auto" />
        </motion.div>
        
        <h1 className="text-4xl font-bold text-amber-400 mb-4">
          Librán Voice Forge
        </h1>
        
        <p className="text-amber-200 mb-8">
          Securing the ancient voices...
        </p>
        
        <motion.div 
          className="flex space-x-2 justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <Zap className="w-4 h-4 text-orange-400" />
          <Shield className="w-4 h-4 text-amber-400" />
        </motion.div>
      </motion.div>
    </div>
  )
}