'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, ChefHat, Fish } from 'lucide-react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Background sushi particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${(i * 7 + 13) % 100}%`,
              top: `${(i * 11 + 17) % 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            🍣
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        {/* Bear Chef Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="text-8xl md:text-9xl mb-4">🐻</div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl md:text-5xl"
          >
            👨‍🍳
          </motion.div>
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black mb-6 text-stone-100"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          404
        </motion.h1>

        {/* Fun Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-stone-200 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
            Oops! This page got eaten by a bear! 🐻
          </h2>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Merriweather, serif' }}>
            While our bear chef is busy making sushi, this page seems to have wandered off. 
            Don&apos;t worry, it&apos;s probably just getting some fresh ingredients!
          </p>
        </motion.div>

        {/* Sushi Making Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mb-8 flex justify-center items-center space-x-4"
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-3xl"
          >
            🍚
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            ⚡
          </motion.div>
          <motion.div
            animate={{ x: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="text-3xl"
          >
            🐟
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 1 }}
            className="text-3xl"
          >
            🍣
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-stone-100 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center space-x-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-amber-600 to-amber-800 text-stone-100 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-amber-700 hover:to-amber-900 transition-all duration-300 flex items-center space-x-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <Home size={20} />
            <span>Return Home</span>
          </motion.button>
        </motion.div>

        {/* Fun Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-12 text-stone-400 text-sm"
          style={{ fontFamily: 'Merriweather, serif' }}
        >
          <p>🐻 &quot;This page is being prepared with love and fresh ingredients!&quot; 🍣</p>
        </motion.div>
      </div>
    </div>
  )
}
