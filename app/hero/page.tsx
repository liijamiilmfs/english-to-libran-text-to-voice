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
  Sparkles,
  BookOpen
} from 'lucide-react'

export default function HeroPage() {
  const [currentScene, setCurrentScene] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showContent, setShowContent] = useState(false)

  console.log('HeroPage rendering, isInitialLoad:', isInitialLoad, 'showContent:', showContent)

  const scenes = [
    {
      title: "The Forge of Words",
      subtitle: "Where Ancient Runes Meet Steam-Powered Magic",
      description: "In the vast steppes where the wind carries whispers of old gods, a new power awakens. The Librán Forge transforms mortal speech into the sacred tongue of the ancestors.",
      elements: ["forge", "runes", "steam", "gears"]
    },
    {
      title: "The Steppe's Echo",
      subtitle: "Where Wind Meets Thunder, Where Past Meets Future",
      description: "Beneath the endless sky of the Western Steppe, where nomadic spirits dance with brass and steam, the ancient voices of the Norse gods find new expression through the power of technology.",
      elements: ["magic", "voice", "ancient", "modern"]
    },
    {
      title: "The Librán Bridge",
      subtitle: "Spanning the Chasm Between Worlds",
      description: "Where the steppe meets the sky, where tradition dances with technology, the Librán Bridge spans the chasm between worlds, carrying the voices of tomorrow.",
      elements: ["bridge", "sky", "dance", "worlds"]
    }
  ]

  // Initial load animation sequence
  useEffect(() => {
    console.log('HeroPage: Starting initial load sequence')
    const initialSequence = async () => {
      // Wait for initial load animation
      console.log('HeroPage: Waiting 2 seconds for initial animation...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('HeroPage: Setting isInitialLoad to false')
      setIsInitialLoad(false)
      
      // Show content after initial animation
      console.log('HeroPage: Waiting 1 second before showing content...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('HeroPage: Setting showContent to true')
      setShowContent(true)
    }

    initialSequence()
  }, [])

  // Scene rotation after initial load
  useEffect(() => {
    if (!isInitialLoad) {
      const interval = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % scenes.length)
      }, 5000) // Change scene every 5 seconds

      return () => clearInterval(interval)
    }
  }, [isInitialLoad, scenes.length])

  const currentSceneData = scenes[currentScene]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 relative overflow-hidden">
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
              <div className="text-6xl font-black text-amber-400/80 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                ᚱᚢᚾᛖᛋ
              </div>
              <motion.div
                className="text-2xl text-amber-300/60 mt-2 font-bold tracking-wide"
                style={{ fontFamily: 'Merriweather, serif' }}
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

            {/* Loading Text */}
            <motion.div
              className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              <div className="text-amber-300 text-lg font-bold tracking-wide" style={{ fontFamily: 'Merriweather, serif' }}>
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
                    zIndex: 0
                  }}
                  animate={{
                    rotate: [0, 360],
                    y: [0, 20, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 10 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5
                  }}
                >
                  <Cog size={48 + i * 8} />
                </motion.div>
              ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-amber-100 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSceneData.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl"
                >
                  <h1 className="text-6xl md:text-8xl font-black text-stone-100 drop-shadow-2xl mb-4 tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
                    {currentSceneData.title}
                  </h1>
                  <h2 className="text-2xl md:text-4xl font-bold text-blue-200 mb-8 tracking-wide" style={{ fontFamily: 'Merriweather, serif' }}>
                    {currentSceneData.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl text-stone-300/90 leading-relaxed mb-12 max-w-2xl mx-auto" style={{ fontFamily: 'Merriweather, serif' }}>
                    {currentSceneData.description}
                  </p>

                  <motion.button
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-stone-100 font-black py-4 px-10 rounded-full text-xl shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center mx-auto border-2 border-blue-400/30"
                    style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/app'}
                  >
                    <Play className="mr-3" size={24} />
                    ENTER THE FORGE
                  </motion.button>

                  <div className="flex justify-center space-x-4 mt-8">
                    {scenes.map((_, index) => (
                      <motion.button
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === currentScene ? 'bg-blue-400' : 'bg-blue-600/50'}`}
                        onClick={() => setCurrentScene(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dynamic Thematic Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {currentSceneData.elements.map((element, i) => {
                const icons = {
                  forge: <Flame className="text-red-500/30" size={36} />,
                  runes: <BookOpen className="text-amber-400/30" size={32} />,
                  steam: <Wind className="text-slate-300/30" size={30} />,
                  gears: <Cog className="text-amber-700/30" size={34} />,
                  magic: <Sparkles className="text-yellow-300/30" size={28} />,
                  voice: <Volume2 className="text-orange-400/30" size={30} />,
                  ancient: <Crown className="text-amber-500/30" size={32} />,
                  modern: <Zap className="text-blue-400/30" size={28} />,
                  steppe: <Mountain className="text-green-500/30" size={30} />,
                  norse: <Sword className="text-gray-400/30" size={34} />,
                  mythology: <Shield className="text-brown-400/30" size={32} />,
                  steampunk: <Cog className="text-gray-500/30" size={36} />,
                  wind: <Wind className="text-orange-300/30" size={26} />,
                  thunder: <Zap className="text-yellow-400/30" size={34} />,
                  brass: <Cog className="text-amber-600/30" size={30} />,
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
                className="text-blue-400/70 rotate-90"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => {
          // Use deterministic positioning to avoid hydration mismatch
          const left = (i * 7 + 13) % 100
          const top = (i * 11 + 17) % 100
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/40 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + (i % 3) * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: (i % 5) * 0.3
            }}
          />
          )
        })}
      </div>
    </div>
  )
}