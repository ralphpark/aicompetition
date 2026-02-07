'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Confetti celebration effect
interface ConfettiProps {
  isActive: boolean
  duration?: number
  particleCount?: number
  onComplete?: () => void
}

export function Confetti({
  isActive,
  duration = 3000,
  particleCount = 50,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    color: string
    size: number
    rotation: number
  }>>([])

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][
          Math.floor(Math.random() * 8)
        ],
        size: 8 + Math.random() * 8,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, particleCount, duration, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              opacity: 1,
              x: `${particle.x}vw`,
              y: -20,
              rotate: 0,
              scale: 1,
            }}
            animate={{
              opacity: [1, 1, 0],
              y: '100vh',
              rotate: particle.rotation + 720,
              scale: [1, 1.2, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Fireworks effect for big wins
interface FireworksProps {
  isActive: boolean
  onComplete?: () => void
}

export function Fireworks({ isActive, onComplete }: FireworksProps) {
  const [explosions, setExplosions] = useState<Array<{
    id: number
    x: number
    y: number
    color: string
  }>>([])

  useEffect(() => {
    if (isActive) {
      const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#9B59B6']
      const newExplosions: typeof explosions = []

      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          setExplosions((prev) => [
            ...prev,
            {
              id: Date.now() + i,
              x: 20 + Math.random() * 60,
              y: 20 + Math.random() * 40,
              color: colors[i % colors.length],
            },
          ])
        }, i * 500)
      }

      const timer = setTimeout(() => {
        setExplosions([])
        onComplete?.()
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [isActive, onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {explosions.map((explosion) => (
          <div
            key={explosion.id}
            style={{
              position: 'absolute',
              left: `${explosion.x}%`,
              top: `${explosion.y}%`,
            }}
          >
            {/* Center burst */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute w-4 h-4 rounded-full"
              style={{ backgroundColor: explosion.color }}
            />

            {/* Particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 100,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 100,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: explosion.color }}
              />
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Floating emojis effect
interface FloatingEmojisProps {
  emojis: string[]
  isActive: boolean
  position?: 'center' | 'random'
}

export function FloatingEmojis({ emojis, isActive, position = 'center' }: FloatingEmojisProps) {
  if (!isActive) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {emojis.map((emoji, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 1,
            x: position === 'center' ? '50%' : `${Math.random() * 100}%`,
            y: '80%',
            scale: 1,
          }}
          animate={{
            opacity: [1, 1, 0],
            y: '-20%',
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
          className="absolute text-4xl"
        >
          {emoji}
        </motion.span>
      ))}
    </div>
  )
}

// Pulse ring effect
interface PulseRingProps {
  color?: string
  size?: number
  duration?: number
}

export function PulseRing({ color = '#22c55e', size = 100, duration = 1 }: PulseRingProps) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration, repeat: Infinity }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}`,
      }}
    />
  )
}

// Screen flash effect
interface ScreenFlashProps {
  color: string
  isActive: boolean
  onComplete?: () => void
}

export function ScreenFlash({ color, isActive, onComplete }: ScreenFlashProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: color }}
        />
      )}
    </AnimatePresence>
  )
}

// Celebration manager hook
interface CelebrationEvent {
  type: 'confetti' | 'fireworks' | 'emojis' | 'flash'
  emojis?: string[]
  color?: string
}

export function useCelebration() {
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null)

  const celebrate = useCallback((event: CelebrationEvent) => {
    setCelebration(event)
  }, [])

  const clearCelebration = useCallback(() => {
    setCelebration(null)
  }, [])

  const CelebrationComponent = () => (
    <>
      <Confetti
        isActive={celebration?.type === 'confetti'}
        onComplete={clearCelebration}
      />
      <Fireworks
        isActive={celebration?.type === 'fireworks'}
        onComplete={clearCelebration}
      />
      <FloatingEmojis
        emojis={celebration?.emojis || ['🎉', '🎊', '✨', '🥳', '🎈']}
        isActive={celebration?.type === 'emojis'}
      />
      <ScreenFlash
        color={celebration?.color || '#22c55e'}
        isActive={celebration?.type === 'flash'}
        onComplete={clearCelebration}
      />
    </>
  )

  return { celebrate, clearCelebration, CelebrationComponent }
}

// Win indicator
interface WinIndicatorProps {
  isVisible: boolean
  amount: number
  position?: { x: number; y: number }
}

export function WinIndicator({ isVisible, amount, position }: WinIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [1, 1, 0], y: -50, scale: [1, 1.2, 1] }}
          exit={{ opacity: 0 }}
          style={position ? { left: position.x, top: position.y } : {}}
          className={cn(
            "absolute font-bold text-2xl text-green-500",
            "drop-shadow-lg",
            !position && "left-1/2 -translate-x-1/2"
          )}
        >
          +${amount.toFixed(2)}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Sparkle cursor effect (for special modes)
export function useSparkleCursor() {
  const [sparkles, setSparkles] = useState<Array<{
    id: number
    x: number
    y: number
  }>>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.9) {
        const newSparkle = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
        }
        setSparkles((prev) => [...prev.slice(-10), newSparkle])
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const SparkleTrail = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.span
            key={sparkle.id}
            initial={{ opacity: 1, scale: 1, x: sparkle.x, y: sparkle.y }}
            animate={{ opacity: 0, scale: 0, y: sparkle.y - 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute text-lg"
          >
            ✨
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )

  return { SparkleTrail }
}
