'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabase } from '@/contexts/SupabaseContext'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase, user } = useSupabase()
  const [error, setError] = useState(null)

  const redirectTo = searchParams.get('redirect') || '/rsvp'

  useEffect(() => {
    async function handleCallback() {
      try {
        // PKCE flow: exchange the code from the URL for a session
        const code = searchParams.get('code')
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Error exchanging code for session:', error)
            setError(error.message)
            return
          }
          // Session is now established — onAuthStateChange in the context
          // will update the user, and the effect below handles the redirect.
          return
        }

        // Implicit flow: tokens are in the URL hash fragment.
        // Supabase client detects these automatically via onAuthStateChange,
        // so we just need to wait for the user to be set.

        // If there's no code AND no hash, something went wrong
        if (!window.location.hash) {
          setError('No authentication credentials found in the URL.')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError('Something went wrong during login. Please try again.')
      }
    }

    handleCallback()
  }, [searchParams, supabase])

  // Redirect once user is authenticated
  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  // Fallback timeout — if nothing happens after 10s, redirect home
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        setError('Login timed out. Please try again.')
      }
    }, 10000)
    return () => clearTimeout(timer)
  }, [user])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Login Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/rsvp')}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo dark:border-pink mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Completing login...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}