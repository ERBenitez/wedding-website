'use client'

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'

export default function Error503() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Death Star Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-gray-800 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Death Star details */}
            <div className="absolute top-6 right-8 w-8 h-8 bg-gray-700 rounded-full" />
            <div className="absolute bottom-8 left-6 w-12 h-2 bg-gray-600 rounded-full transform rotate-45" />
            <div className="absolute top-1/2 left-1/2 w-16 h-1 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            {/* Superlaser focus lens */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-700" />
          </div>
          {/* Warning triangle */}
          <div className="absolute -bottom-2 -right-2 bg-yellow-500 rounded-full p-2">
            <AlertTriangle className="w-6 h-6 text-yellow-900" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-indigo dark:text-pink mb-4 font-display">
          503
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          {t('errors.503.title')}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('errors.503.message')}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">
            &ldquo;I find your lack of service disturbing.&rdquo;
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
            Error Code: DS-1 ORBITAL BATTLE STATION OFFLINE
          </p>
        </div>
      </motion.div>
    </div>
  )
}
