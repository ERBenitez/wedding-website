'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export function LightsaberDivider({ color = 'pink', delay = 0, className = '' }) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsActive(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  const colorClasses = {
    pink: 'from-pink via-pink-light to-pink',
    indigo: 'from-indigo via-indigo-light to-indigo',
    gold: 'from-gold via-gold-light to-gold',
  }

  const glowColors = {
    pink: 'shadow-pink',
    indigo: 'shadow-indigo',
    gold: 'shadow-gold',
  }

  return (
    <div className={`relative h-2 w-full overflow-hidden ${className}`}>
      {/* Hilt */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-8 h-4 bg-gray-800 dark:bg-gray-600 rounded-sm flex items-center justify-center">
          <div className="w-6 h-1 bg-gray-600 dark:bg-gray-400 rounded-full" />
        </div>
      </div>

      {/* Blade */}
      <motion.div
        className={`absolute left-1/2 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r ${colorClasses[color]} rounded-full`}
        initial={{ width: 0, x: '-50%' }}
        animate={isActive ? { width: '50%', x: '-100%' } : { width: 0, x: '-50%' }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        style={{
          boxShadow: `0 0 10px currentColor, 0 0 20px currentColor`,
        }}
      />
      <motion.div
        className={`absolute left-1/2 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-l ${colorClasses[color]} rounded-full`}
        initial={{ width: 0, x: '-50%' }}
        animate={isActive ? { width: '50%', x: '0%' } : { width: 0, x: '-50%' }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        style={{
          boxShadow: `0 0 10px currentColor, 0 0 20px currentColor`,
        }}
      />

      {/* Glow effect */}
      {isActive && (
        <motion.div
          className={`absolute inset-0 opacity-30`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            background: `radial-gradient(ellipse at center, currentColor 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  )
}

export function LightsaberLoading({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          onComplete?.()
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center space-y-8">
        <h2 className="text-2xl font-display text-indigo dark:text-pink tracking-widest">
          INITIALIZING HYPERDRIVE
        </h2>
        
        {/* Lightsaber progress bar */}
        <div className="relative w-64 h-3 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo via-pink to-gold rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
            style={{
              boxShadow: '0 0 10px #ee9b9b, 0 0 20px #2d2f8e',
            }}
          />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {progress}%
        </p>
      </div>
    </div>
  )
}
