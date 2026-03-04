'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSupabase()
  
  // Get the intended destination from query params
  const redirectTo = searchParams.get('redirect') || '/rsvp'

  useEffect(() => {
    // The magic link automatically logs the user in when they visit this page
    // We just need to wait a moment for the session to be established
    const timer = setTimeout(() => {
      if (user) {
        router.push(redirectTo)
      } else {
        // If no user after a moment, redirect to home
        router.push('/')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, router, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo dark:border-pink mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Completing login...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we verify your magic link
        </p>
      </div>
    </div>
  )
}
