'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, BookOpen, Scroll, Eye, Search, Sparkles } from 'lucide-react'

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
      {/* Background mystical particles */}
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
            {['⚡', '🔮', '✨', '📜', '📚'][i % 5]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-8 max-w-4xl mx-auto">
        {/* Lost Archivist Video */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="relative w-full max-w-2xl mx-auto">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto rounded-lg shadow-2xl border-2 border-libran-gold/30"
              poster="/bear-archivist-404.mp4"
            >
              <source src="/bear-archivist-404.mp4" type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">🧙‍♂️</div>
                  <div className="text-2xl text-libran-gold">The Lost Archivist</div>
                </div>
              </div>
            </video>
            
            {/* Overlay text on video */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4"
            >
              <div className="text-libran-gold font-bold text-lg" style={{ fontFamily: 'Cinzel, serif' }}>
                "This is not the page you're looking for..."
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black mb-6 text-libran-gold drop-shadow-lg"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          404
        </motion.h1>

        {/* Lost Archivist Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-stone-200 mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
            The Lost Archivist
          </h2>
          <p className="text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Merriweather, serif' }}>
            This is not the page you&apos;re looking for...
          </p>
        </motion.div>


        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-slate-700 to-slate-800 text-stone-200 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-300 flex items-center space-x-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-libran-gold to-amber-600 text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg hover:from-amber-600 hover:to-libran-gold transition-all duration-300 flex items-center space-x-2"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <Home size={20} />
            <span>Return to the Forge</span>
          </motion.button>
        </motion.div>

        {/* Mystical Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-12 text-stone-400 text-sm"
          style={{ fontFamily: 'Merriweather, serif' }}
        >
          <p>🧙‍♂️ &quot;The ancient scrolls speak of many paths, but this one seems to have vanished into the mists of time...&quot;</p>
        </motion.div>
      </div>
    </div>
  )
}