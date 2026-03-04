'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabase } from '@/contexts/SupabaseContext'
import { getGuestByUrlCode, getGuestByEmail, updateGuestRSVP } from '@/lib/supabase'
import { LightsaberDivider } from '@/components/LightsaberDivider'
import { Check, X, Users, Utensils, AlertCircle, Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function RSVP() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCode = searchParams.get('code')
  
  const { user, signIn, signOut } = useSupabase()
  
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  // Email login states
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState(null)
  
  // RSVP form states
  const [rsvp, setRsvp] = useState(null)
  const [rsvpCount, setRsvpCount] = useState(1)
  const [foodRestrictions, setFoodRestrictions] = useState('')

  useEffect(() => {
    async function loadGuest() {
      try {
        let guestData = null

        // Try to load by URL code first
        if (urlCode) {
          guestData = await getGuestByUrlCode(urlCode)
        }

        // If no URL code or not found, try by logged-in user email
        if (!guestData && user?.email) {
          guestData = await getGuestByEmail(user.email)
        }

        if (guestData) {
          setGuest(guestData)
          setRsvp(guestData.rsvp)
          setRsvpCount(guestData.rsvp_count || 1)
          setFoodRestrictions(guestData.food_restrictions || '')
          
          if (guestData.language && guestData.language !== i18n.language) {
            i18n.changeLanguage(guestData.language)
          }
        }
      } catch (err) {
        console.error('Error loading guest:', err)
        setError('generic')
      }
      setLoading(false)
    }

    loadGuest()
  }, [urlCode, user, i18n])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setEmailError(null)
    setSendingEmail(true)

    try {
      // First check if this email exists in our guest list
      const guestData = await getGuestByEmail(email)
      
      if (!guestData) {
        setEmailError('Email not found in our guest list. Please use the email you provided to the couple, or use your personal link.')
        setSendingEmail(false)
        return
      }

      // Send magic link
      await signIn(email)
      setEmailSent(true)
    } catch (err) {
      console.error('Error sending magic link:', err)
      setEmailError('Failed to send login link. Please try again.')
    }

    setSendingEmail(false)
  }

  const handleRSVPSubmit = async (e) => {
    e.preventDefault()
    if (!guest) return

    setSubmitting(true)
    setError(null)

    try {
      await updateGuestRSVP(guest.id, {
        rsvp,
        rsvpCount: rsvp ? rsvpCount : 0,
        foodRestrictions,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Error submitting RSVP:', err)
      setError('generic')
    }

    setSubmitting(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-indigo dark:text-pink">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  // Not logged in and no valid guest - show email login
  if (!guest && !user) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center"
          >
            <AnimatePresence mode="wait">
              {!emailSent ? (
                <motion.div
                  key="email-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-indigo/10 dark:bg-pink/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-indigo dark:text-pink" />
                  </div>
                  
                  <h1 className="text-2xl font-bold mb-2 text-indigo dark:text-pink">
                    {t('rsvp.title')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter your email to access your invitation
                  </p>
                  
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="input-field text-center"
                      />
                    </div>
                    
                    {emailError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">
                        {emailError}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={sendingEmail}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Send Magic Link
                        </>
                      )}
                    </button>
                  </form>
                  
                  {urlCode && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500">
                        Or use your personal link
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="email-sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-green-600 mb-4">
                    Check Your Email!
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We&apos;ve sent a magic link to:
                  </p>
                  
                  <p className="text-lg font-medium text-indigo dark:text-pink mb-6">
                    {email}
                  </p>
                  
                  <p className="text-sm text-gray-500">
                    Click the link in the email to log in. If you don&apos;t see it, check your spam folder.
                  </p>
                  
                  <button
                    onClick={() => {
                      setEmailSent(false)
                      setEmail('')
                    }}
                    className="mt-6 text-sm text-gray-500 hover:text-indigo dark:hover:text-pink flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Use a different email
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    )
  }

  // Logged in but no guest record found
  if (!guest && user) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Guest Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn&apos;t find an invitation for <strong>{user.email}</strong>. Please contact the couple or use your personal link.
            </p>
            <button
              onClick={handleLogout}
              className="btn-outline"
            >
              {t('rsvp.logout')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo dark:text-pink">
              {t('rsvp.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('rsvp.subtitle')}
            </p>
            <LightsaberDivider color="pink" delay={300} className="mt-6" />
          </div>

          {guest && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                {t('rsvp.greeting', { name: guest.name })}
              </h2>
              <p className="text-indigo dark:text-pink font-medium">
                {t('rsvp.reservedSpots', { count: guest.reserved_spots })}
              </p>
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                {t('common.success')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('rsvp.successMessage')}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-6">
              {/* RSVP Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('rsvp.willYouAttend')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvp(true)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      rsvp === true
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <Check className={`w-6 h-6 mx-auto mb-2 ${rsvp === true ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={rsvp === true ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {t('rsvp.yes')}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvp(false)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      rsvp === false
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                    }`}
                  >
                    <X className={`w-6 h-6 mx-auto mb-2 ${rsvp === false ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={rsvp === false ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {t('rsvp.no')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Number of Attendees */}
              {rsvp === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    {t('rsvp.howMany')}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max={guest?.reserved_spots || 1}
                      value={rsvpCount}
                      onChange={(e) => setRsvpCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo"
                    />
                    <span className="text-2xl font-bold text-indigo dark:text-pink w-12 text-center">
                      {rsvpCount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Max: {guest?.reserved_spots} people
                  </p>
                </motion.div>
              )}

              {/* Food Restrictions */}
              {rsvp === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Utensils className="w-4 h-4 inline mr-2" />
                    {t('rsvp.foodRestrictions')}
                  </label>
                  <textarea
                    value={foodRestrictions}
                    onChange={(e) => setFoodRestrictions(e.target.value)}
                    placeholder={t('rsvp.foodRestrictionsPlaceholder')}
                    rows={3}
                    className="input-field resize-none"
                  />
                </motion.div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">
                  {t('rsvp.errorMessage')}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={rsvp === null || submitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t('common.loading') : guest?.rsvp !== null ? t('rsvp.update') : t('rsvp.submit')}
                </button>
                
                {user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-outline"
                  >
                    {t('rsvp.logout')}
                  </button>
                )}
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
