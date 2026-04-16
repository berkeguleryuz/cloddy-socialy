"use client"

import { useState, useEffect, useCallback, memo } from 'react'

interface LevelUpCelebrationProps {
  newLevel: number
  onClose: () => void
}

// Confetti particle
interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

const LevelUpCelebration = memo(function LevelUpCelebration({ newLevel, onClose }: LevelUpCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [showContent, setShowContent] = useState(false)

  // Colors matching the app theme
  const colors = ['#7750f8', '#40d04f', '#23d2e2', '#f9515c', '#ffd700']

  // Generate confetti
  const generateConfetti = useCallback(() => {
    const newParticles: Particle[] = []
    const particleCount = 100

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 20,
      })
    }

    setParticles(newParticles)
  }, [])

  // Animation loop
  useEffect(() => {
    generateConfetti()
    setShowContent(true)

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2, // gravity
          rotation: p.rotation + p.rotationSpeed,
        })).filter((p) => p.y < window.innerHeight + 50)
      )
    }, 16)

    // Auto-close after 5 seconds
    const timeout = setTimeout(() => {
      handleClose()
    }, 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [generateConfetti])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary via-secondary to-primary opacity-30 animate-pulse" />

        {/* Level badge */}
        <div className="relative">
          {/* Outer ring animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-primary/30 animate-ping" />
          </div>

          {/* Main badge */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              {/* Background hexagon */}
              <polygon
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                fill="url(#levelGradient)"
                stroke="url(#borderGradient)"
                strokeWidth="2"
              />
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7750f8" />
                  <stop offset="100%" stopColor="#40d04f" />
                </linearGradient>
                <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7750f8" />
                  <stop offset="50%" stopColor="#23d2e2" />
                  <stop offset="100%" stopColor="#40d04f" />
                </linearGradient>
              </defs>
            </svg>

            {/* Level number */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-black text-white drop-shadow-lg">
                {newLevel}
              </span>
            </div>

            {/* Stars */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 60}deg) translateY(-90px)`,
                  animation: `twinkle 1s ease-in-out infinite ${i * 0.1}s`,
                }}
              >
                <svg viewBox="0 0 24 24" fill="#ffd700" className="animate-pulse">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
          </div>

          {/* Text content */}
          <div className="relative space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary font-medium">
              Congratulations!
            </p>
            <h1 className="text-4xl font-black text-white">
              Level Up!
            </h1>
            <p className="text-text-muted">
              You reached <span className="text-secondary font-bold">Level {newLevel}</span>
            </p>
          </div>

          {/* XP bar visual */}
          <div className="mt-8 w-64 mx-auto">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Close hint */}
          <p className="mt-6 text-xs text-text-muted animate-pulse">
            Click anywhere to continue
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: rotate(var(--rotation)) translateY(-90px) scale(0.8); }
          50% { opacity: 1; transform: rotate(var(--rotation)) translateY(-90px) scale(1.2); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
})

export default LevelUpCelebration

// Hook to manage level up celebrations
export function useLevelUpCelebration() {
  const [celebration, setCelebration] = useState<{ newLevel: number } | null>(null)

  useEffect(() => {
    // Listen for level up events
    const handleLevelUp = (event: CustomEvent<{ newLevel: number }>) => {
      setCelebration({ newLevel: event.detail.newLevel })
    }

    window.addEventListener('level-up' as any, handleLevelUp)

    return () => {
      window.removeEventListener('level-up' as any, handleLevelUp)
    }
  }, [])

  const closeCelebration = () => setCelebration(null)

  // Helper to trigger level up (call this when XP increases past threshold)
  const triggerLevelUp = (newLevel: number) => {
    window.dispatchEvent(new CustomEvent('level-up', { detail: { newLevel } }))
  }

  return {
    celebration,
    closeCelebration,
    triggerLevelUp,
  }
}
