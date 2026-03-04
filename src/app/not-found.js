'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Lost in space */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto relative">
            {/* Planet */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo to-pink rounded-full" />
            {/* Ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-12 border-4 border-gold rounded-full transform rotate-45" />
            {/* Question mark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <HelpCircle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-6xl font-bold text-indigo dark:text-pink mb-4 font-display">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Lost in Hyperspace
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you&apos;re looking for has been swallowed by a black hole or never existed in this galaxy.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">
            &ldquo;This is not the page you&apos;re looking for.&rdquo;
          </p>
          <p className="text-xs text-gray-400">
            *waves hand* Move along, move along.
          </p>
          
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Base
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
