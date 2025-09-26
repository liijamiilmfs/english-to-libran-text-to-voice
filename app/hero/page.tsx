'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sword, 
  Shield, 
  Zap, 
  Crown, 
  Mountain, 
  Wind, 
  Flame, 
  Cog,
  ChevronRight,
  Play,
  Volume2,
  Sparkles
} from 'lucide-react'

export default function HeroPage() {
  const [currentScene, setCurrentScene] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const scenes = [
    {
      title: "The Forge of Words",
      subtitle: "Where Ancient Runes Meet Steam-Powered Magic",
      description: "In the vast steppes where the wind carries whispers of old gods, a new power awakens. The Librán Forge transforms mortal speech into the sacred tongue of the ancestors.",
      elements: ["forge", "runes", "steam", "wind"]
    },
    {
      title: "The Voice of Thunder",
      subtitle: "Steam-Powered Incantations of the North",
      description: "Through brass and copper, through gears and steam, the ancient voices speak. Each word forged in the fires of innovation, each syllable blessed by the old ways.",
      elements: ["thunder", "brass", "gears", "fire"]
    },
    {
      title: "The Bridge of Ages",
      subtitle: "Connecting Past and Future Through Sound",
      description: "Where the steppe meets the sky, where tradition dances with technology, the Librán Bridge spans the chasm between worlds, carrying the voices of tomorrow.",
      elements: ["bridge", "sky", "dance", "worlds"]
    }
  ]

  // Initial load animation sequence
  useEffect(() => {
    const initialSequence = async () => {
      // Wait for initial load animation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsInitialLoad(false)
      
      // Show content after initial animation
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowContent(true)
    }

    initialSequence()
  }, [])

  // Scene rotation after initial load
  useEffect(() => {
    if (!isInitialLoad) {
      const interval = setInterval(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentScene((prev) => (prev + 1) % scenes.length)
          setIsAnimating(false)
        }, 500)
      }, 8000)

      return () => clearInterval(interval)
    }
  }, [isInitialLoad, scenes.length])

  const currentSceneData = scenes[currentScene]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-orange-900 relative overflow-hidden">
      {/* Initial Load Animation - Forge Awakening */}
      <AnimatePresence>
        {isInitialLoad && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Forge Sparks Animation */}
            <div className="relative">
              {/* Central Forge */}
              <motion.div
                className="w-32 h-32 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #f97316 0%, #dc2626 50%, #0f172a 100%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                    "0 0 40px rgba(251, 191, 36, 0.8)",
                    "0 0 20px rgba(251, 191, 36, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Sparks flying out */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-amber-400 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    x: [0, Math.cos(i * 30 * Math.PI / 180) * 100],
                    y: [0, Math.sin(i * 30 * Math.PI / 180) * 100],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              ))}
            </div>

            {/* Runic Inscription Appearing */}
            <motion.div
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <div className="text-6xl font-bold text-amber-400/80 tracking-widest">
                ᚱᚢᚾᛖᛋ
              </div>
              <motion.div
                className="text-2xl text-amber-300/60 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                The Ancient Forge Awakens
              </motion.div>
            </motion.div>

            {/* Steampunk Pressure Gauges */}
            <motion.div
              className="absolute top-1/6 right-1/6"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, duration: 1, type: "spring" }}
            >
              <div className="w-16 h-16 border-4 border-amber-600 rounded-full relative">
                <div className="absolute inset-2 border-2 border-amber-400 rounded-full"></div>
                <motion.div
                  className="absolute top-1/2 left-1/2 w-1 h-8 bg-amber-400 origin-bottom"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute top-1 text-xs text-amber-400 font-bold">STEAM</div>
              </div>
            </motion.div>

            {/* Brass Pipes */}
            <motion.div
              className="absolute bottom-1/4 left-1/6"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.8, duration: 1.5 }}
            >
              <div className="w-32 h-4 bg-gradient-to-r from-amber-700 to-amber-600 rounded-full"></div>
              <div className="w-2 h-8 bg-amber-600 ml-16 -mt-2"></div>
            </motion.div>

            {/* Additional Runic Circles */}
            <motion.div
              className="absolute top-1/2 right-1/3"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, duration: 1.5, type: "spring" }}
            >
              <div className="w-20 h-20 border-2 border-amber-500/60 rounded-full flex items-center justify-center">
                <div className="text-2xl text-amber-400/70">ᚦ</div>
              </div>
            </motion.div>

            {/* Steam Rising */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 bg-gradient-to-t from-amber-200/30 to-transparent rounded-full blur-sm"
                style={{
                  left: `${30 + i * 10}%`,
                  bottom: '20%'
                }}
                animate={{
                  y: [-20, -120, -20],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Gear Assembly Animation */}
            <motion.div
              className="absolute top-1/3 right-1/4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.5, duration: 1.5, type: "spring" }}
            >
              <Cog className="w-16 h-16 text-amber-600/60" />
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 left-1/4"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.8, duration: 1.5, type: "spring" }}
            >
              <Cog className="w-12 h-12 text-orange-500/60" />
            </motion.div>

            {/* Thor's Hammer - Mjölnir */}
            <motion.div
              className="absolute top-1/3 left-1/6"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2.2, duration: 1.2, type: "spring" }}
            >
              <div className="text-4xl text-amber-500/80">⚡</div>
              <div className="text-xs text-amber-400/60 mt-1 font-bold">MJÖLNIR</div>
            </motion.div>

            {/* Runic Power Lines */}
            <motion.div
              className="absolute top-1/2 left-1/4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.4, duration: 1 }}
            >
              <div className="flex space-x-2">
                {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ'].map((rune, i) => (
                  <motion.div
                    key={rune}
                    className="text-amber-400/60 text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.6 + i * 0.1, duration: 0.5 }}
                  >
                    {rune}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Loading Text */}
            <motion.div
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              <div className="text-amber-300 text-lg">
                Awakening the Voice Forge...
              </div>
              <motion.div
                className="w-32 h-1 bg-amber-600/30 rounded-full mt-2 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.7, duration: 0.3 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Only show after initial animation */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
        {/* Floating Gears */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-600/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Cog size={40 + i * 10} />
          </motion.div>
        ))}

        {/* Floating Runes */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-orange-400/30 text-2xl font-bold"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'][i]}
          </motion.div>
        ))}

        {/* Steam Effects */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-t from-amber-200/20 to-transparent rounded-full blur-xl"
            style={{
              left: `${20 + i * 20}%`,
              bottom: `${-10 + i * 5}%`,
            }}
            animate={{
              y: [-50, -150, -50],
              opacity: [0, 0.6, 0],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl"
          >
            {/* Scene Indicator */}
            <motion.div 
              className="flex justify-center space-x-2 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {scenes.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentScene ? 'bg-amber-400' : 'bg-amber-600/50'
                  }`}
                  animate={{
                    scale: index === currentScene ? 1.2 : 1,
                    opacity: index === currentScene ? 1 : 0.5
                  }}
                />
              ))}
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {currentSceneData.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.h2 
              className="text-2xl md:text-3xl font-semibold mb-8 text-amber-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {currentSceneData.subtitle}
            </motion.h2>

            {/* Description */}
            <motion.p 
              className="text-lg md:text-xl text-amber-100/90 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {currentSceneData.description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 191, 36, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 shadow-lg"
              >
                <Play size={24} />
                <span>Enter the Forge</span>
                <ChevronRight size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251, 191, 36, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 px-8 py-4 rounded-lg font-semibold text-lg flex items-center space-x-2 transition-colors"
              >
                <Volume2 size={24} />
                <span>Hear the Voices</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {currentSceneData.elements.map((element, i) => {
            const icons = {
              forge: <Cog className="text-amber-500/30" size={32} />,
              runes: <Sparkles className="text-orange-400/30" size={28} />,
              steam: <Wind className="text-amber-300/30" size={30} />,
              wind: <Wind className="text-orange-300/30" size={26} />,
              thunder: <Zap className="text-yellow-400/30" size={34} />,
              brass: <Cog className="text-amber-600/30" size={30} />,
              gears: <Cog className="text-orange-500/30" size={28} />,
              fire: <Flame className="text-red-400/30" size={32} />,
              bridge: <Mountain className="text-amber-500/30" size={30} />,
              sky: <Wind className="text-blue-300/30" size={28} />,
              dance: <Sparkles className="text-orange-400/30" size={26} />,
              worlds: <Crown className="text-amber-400/30" size={32} />
            }

            return (
              <motion.div
                key={`${element}-${i}`}
                className="absolute"
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, -5, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              >
                {icons[element as keyof typeof icons]}
              </motion.div>
            )
          })}
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight 
            size={24} 
            className="text-amber-400/70 rotate-90" 
          />
        </motion.div>
      </div>

            {/* Particle Effects */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
