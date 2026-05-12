'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, signInWithEmail, verifyOtp } from '@/lib/supabase'

const SupabaseContext = createContext({})

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, captchaToken) => {
    const { error } = await signInWithEmail(email, captchaToken)
    if (error) throw error
  }

  const verifyCode = async (email, token) => {
    const { error } = await verifyOtp(email, token)
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    supabase,
    user,
    loading,
    signIn,
    verifyCode,
    signOut
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}