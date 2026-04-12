"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/contexts/SupabaseContext";
import {
  getGuestByUrlCode,
  getGuestByEmail,
  updateGuestRSVP,
} from "@/lib/supabase";
import { LightsaberDivider } from "@/components/LightsaberDivider";
import {
  Check,
  X,
  Users,
  Utensils,
  AlertCircle,
  Mail,
  Loader2,
  ArrowLeft,
} from "lucide-react";

function RSVPContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCode = searchParams.get("code");
  const urlCode = (() => {
    if (rawCode) {
      sessionStorage.setItem("guestCode", rawCode);
      return rawCode;
    }
    return typeof window !== "undefined"
      ? sessionStorage.getItem("guestCode")
      : null;
  })();

  const { user, signIn, signOut } = useSupabase();

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Email login states
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);

  // RSVP form states
  const [rsvp, setRsvp] = useState(null);
  const [adultsCount, setAdultsCount] = useState(1);
  const [kids7to9Count, setKids7to9Count] = useState(0);
  const [kids6UnderCount, setKids6UnderCount] = useState(0);
  const [foodRestrictions, setFoodRestrictions] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [countdown, setCountdown] = useState(5);

  const rsvpCount = adultsCount + kids7to9Count + kids6UnderCount;

  useEffect(() => {
    if (success) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      const timer = setTimeout(() => {
        router.push("/");
      }, 5000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [success, router]);

  useEffect(() => {
    async function loadGuest() {
      try {
        let guestData = null;

        // Try to load by URL code first
        if (urlCode) {
          guestData = await getGuestByUrlCode(urlCode);
        }

        // If no URL code or not found, try by logged-in user email
        if (!guestData && user?.email) {
          guestData = await getGuestByEmail(user.email);

          if (guestData?.url_code) {
            try {
              sessionStorage.setItem("guestCode", guestData.url_code);
            } catch {}
          }
        }

        if (guestData) {
          setGuest(guestData);
          setRsvp(guestData.rsvp);
          setAdultsCount(guestData.adults_count || 1);
          setKids7to9Count(guestData.kids_7_to_9_count || 0);
          setKids6UnderCount(guestData.kids_6_under_count || 0);
          setFoodRestrictions(guestData.food_restrictions || "");
          setGuestEmail(guestData.email || "");

          if (guestData.language) {
            const manuallySet = localStorage.getItem("preferredLanguage");
            if (!manuallySet && guestData.language !== i18n.language) {
              i18n.changeLanguage(guestData.language);
            }
          }
        }
      } catch (err) {
        console.error("Error loading guest:", err);
        setError("generic");
      }
      setLoading(false);
    }

    loadGuest();
  }, [urlCode, user, i18n]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    // Check cooldown from localStorage
    const lastSent = localStorage.getItem("magicLinkLastSent");
    if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
      const secondsLeft = Math.ceil(
        (60000 - (Date.now() - parseInt(lastSent))) / 1000,
      );
      setEmailError(
        t("rsvp.cooldown", { seconds: secondsLeft }),
      );
      return;
    }

    setEmailError(null);
    setSendingEmail(true);

    try {
      const guestData = await getGuestByEmail(email);
      if (!guestData) {
        setEmailError(
          t("rsvp.emailNotFound"),
        );
        setSendingEmail(false);
        return;
      }

      // Send magic link
      await signIn(email);
      localStorage.setItem("magicLinkLastSent", Date.now().toString());
      setEmailSent(true);
    } catch (err) {
      setEmailError(t("rsvp.sendFailed"));
    }

    setSendingEmail(false);
  };

  const handleRSVPSubmit = async (e) => {
    e.preventDefault();
    if (!guest) return;

    setSubmitting(true);
    setError(null);

    try {
      await updateGuestRSVP(guest.id, {
        rsvp,
        rsvpCount: rsvp ? rsvpCount : 0,
        adultsCount: rsvp ? adultsCount : 0,
        kids7to9Count: rsvp ? kids7to9Count : 0,
        kids6UnderCount: rsvp ? kids6UnderCount : 0,
        foodRestrictions,
        email: guestEmail || null,
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error submitting RSVP:", err);
      setError("generic");
    }

    setSubmitting(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-indigo dark:text-pink">
          {t("common.loading")}
        </div>
      </div>
    );
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
                    {t("rsvp.title")}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {t("rsvp.enterEmail")}
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
                          {t("rsvp.sending")}
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          {t("rsvp.sendMagicLink")}
                        </>
                      )}
                    </button>
                  </form>

                  {urlCode && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500">
                        {t("rsvp.orUsePersonalLink")}
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
                    {t("rsvp.checkEmail")}
                  </h2>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t("rsvp.magicLinkSent")}
                  </p>

                  <p className="text-lg font-medium text-indigo dark:text-pink mb-6">
                    {email}
                  </p>

                  <p className="text-sm text-gray-500">
                    {t("rsvp.checkSpam")}
                  </p>

                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="mt-6 text-sm text-gray-500 hover:text-indigo dark:hover:text-pink flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("rsvp.differentEmail")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    );
  }

  // Logged in but no guest record found
  if (!guest && user) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="glass-card">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {t("rsvp.guestNotFound")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("rsvp.guestNotFoundMessage", { email: user.email })}
            </p>
            <button onClick={handleLogout} className="btn-outline">
              {t("rsvp.logout")}
            </button>
          </div>
        </div>
      </div>
    );
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
              {t("rsvp.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("rsvp.subtitle")}
            </p>
            <LightsaberDivider color="pink" delay={300} className="mt-6" />
          </div>

          {guest && (
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                {t("rsvp.greeting", { name: guest.name })}
              </h2>
              <p className="text-indigo dark:text-pink font-medium">
                {t("rsvp.reservedSpots", { count: guest.reserved_spots })}
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
                {t("common.success")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("rsvp.successMessage")}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {t("rsvp.redirecting", { countdown })}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRSVPSubmit} className="space-y-6">
              {/* RSVP Response */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("rsvp.willYouAttend")}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRsvp(true)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      rsvp === true
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-green-300"
                    }`}
                  >
                    <Check
                      className={`w-6 h-6 mx-auto mb-2 ${rsvp === true ? "text-green-500" : "text-gray-400"}`}
                    />
                    <span
                      className={
                        rsvp === true
                          ? "text-green-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      {t("rsvp.yes")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRsvp(false)}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${
                      rsvp === false
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-red-300"
                    }`}
                  >
                    <X
                      className={`w-6 h-6 mx-auto mb-2 ${rsvp === false ? "text-red-500" : "text-gray-400"}`}
                    />
                    <span
                      className={
                        rsvp === false
                          ? "text-red-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      {t("rsvp.no")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Number of Attendees by Age Group */}
              {rsvp === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Users className="w-4 h-4 inline mr-2" />
                    {t("rsvp.howMany")}
                  </label>

                  {/* Adults / +9 */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {t("rsvp.adults")}
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => setAdultsCount((c) => Math.max(1, c - 1))}
                        disabled={adultsCount <= 1}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        −
                      </button>
                      <span className="text-4xl font-bold text-indigo dark:text-pink w-12 text-center">
                        {adultsCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAdultsCount((c) =>
                            rsvpCount < (guest?.reserved_spots || 1) ? c + 1 : c
                          )
                        }
                        disabled={rsvpCount >= (guest?.reserved_spots || 1)}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Kids 7-9 */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {t("rsvp.kids7to9")}
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => setKids7to9Count((c) => Math.max(0, c - 1))}
                        disabled={kids7to9Count <= 0}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        −
                      </button>
                      <span className="text-4xl font-bold text-indigo dark:text-pink w-12 text-center">
                        {kids7to9Count}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setKids7to9Count((c) =>
                            rsvpCount < (guest?.reserved_spots || 1) ? c + 1 : c
                          )
                        }
                        disabled={rsvpCount >= (guest?.reserved_spots || 1)}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Kids 6 and under */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
                      {t("rsvp.kids6under")}
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <button
                        type="button"
                        onClick={() => setKids6UnderCount((c) => Math.max(0, c - 1))}
                        disabled={kids6UnderCount <= 0}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        −
                      </button>
                      <span className="text-4xl font-bold text-indigo dark:text-pink w-12 text-center">
                        {kids6UnderCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setKids6UnderCount((c) =>
                            rsvpCount < (guest?.reserved_spots || 1) ? c + 1 : c
                          )
                        }
                        disabled={rsvpCount >= (guest?.reserved_spots || 1)}
                        className="w-10 h-10 rounded-full border-2 border-indigo dark:border-pink text-indigo dark:text-pink text-xl font-bold disabled:opacity-30 hover:bg-indigo hover:text-white dark:hover:bg-pink transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {t("rsvp.totalAttending")}: <span className="font-bold text-indigo dark:text-pink">{rsvpCount}</span> / {guest?.reserved_spots}{" "}
                    {guest?.reserved_spots === 1 ? t("rsvp.person") : t("rsvp.people")}
                  </p>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t("rsvp.emailLabel")}{" "}
                  <span className="text-gray-400 font-normal">{t("rsvp.emailOptional")}</span>
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("rsvp.emailHelp")}
                </p>
              </div>

              {/* Food Restrictions */}
              {rsvp === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    <Utensils className="w-4 h-4 inline mr-2" />
                    {t("rsvp.foodRestrictions")}
                  </label>
                  <textarea
                    value={foodRestrictions}
                    onChange={(e) => setFoodRestrictions(e.target.value)}
                    placeholder={t("rsvp.foodRestrictionsPlaceholder")}
                    rows={3}
                    className="input-field resize-none"
                  />
                </motion.div>
              )}

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 text-sm">
                  {t("rsvp.errorMessage")}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={rsvp === null || submitting}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? t("common.loading")
                    : guest?.rsvp !== null
                      ? t("rsvp.update")
                      : t("rsvp.submit")}
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-500 text-center pt-2">
                <Trans
                  i18nKey="rsvp.privacyNotice"
                  components={{
                    1: <a href="/privacy" className="underline hover:text-indigo dark:hover:text-pink" />,
                  }}
                />
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function RSVP() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-indigo dark:text-pink">Loading...</div>
      </div>
    }>
      <RSVPContent />
    </Suspense>
  );
}