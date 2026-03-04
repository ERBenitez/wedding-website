'use client'

import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="w-full py-8 bg-gradient-to-r from-indigo/5 to-pink/5 dark:from-indigo/10 dark:to-pink/10 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-lg font-accent text-indigo dark:text-pink">
            May the Force be with you
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-pink fill-pink" /> by Olivia & Esteban
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2026 Olivia & Esteban. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
