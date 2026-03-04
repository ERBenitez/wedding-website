'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Coffee, Home } from 'lucide-react'

export default function Error418() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Teapot/R2-D2 hybrid */}
        <div className="relative mb-8">
          <div className="w-32 h-40 mx-auto relative">
            {/* R2-D2 body */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-28 bg-white rounded-lg border-4 border-gray-300 overflow-hidden">
              {/* Body details */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-8 bg-blue-500 rounded" />
              <div className="absolute top-12 left-2 w-6 h-6 bg-red-500 rounded-full" />
              <div className="absolute top-12 right-2 w-6 h-6 bg-blue-400 rounded-full" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-8 bg-gray-200 rounded" />
            </div>
            {/* Dome head */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-16 bg-blue-600 rounded-t-full border-4 border-gray-300 overflow-hidden">
              {/* Eye */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-black rounded-full border-2 border-gray-400">
                <div className="absolute top-1 right-2 w-2 h-2 bg-blue-400 rounded-full" />
              </div>
            </div>
            {/* Steam */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2"
              animate={{ y: [-5, -15, -5], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coffee className="w-6 h-6 text-gray-400" />
            </motion.div>
          </div>
        </div>

        <h1 className="text-6xl font-bold text-indigo dark:text-pink mb-4 font-display">
          418
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          {t('errors.418.title')}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('errors.418.message')}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">
            &ldquo;Beep boop beep... *steam whistle* ...beep!&rdquo;
          </p>
          <p className="text-xs text-gray-400">
            - R2-D2 (probably)
          </p>
          
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Base
          </Link>
        </div>

        {/* Easter egg hint */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400">
            HTCPCP/1.0 Error: 418 I&apos;m a Teapot
          </p>
          <p className="text-xs text-gray-400 mt-1">
            (Yes, this is a real HTTP status code)
          </p>
        </div>
      </motion.div>
    </div>
  )
}
