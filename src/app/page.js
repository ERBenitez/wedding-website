"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Link from "next/link";
import { getGuestByUrlCode } from "@/lib/supabase";
import { LightsaberDivider } from "@/components/LightsaberDivider";
import { Calendar, MapPin, Heart, Church, Shirt, PartyPopper, Cake } from "lucide-react";

function HomeContent() {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();

  const rawCode = useMemo(() => searchParams.get("code"), [searchParams]);
  const [urlCode, setUrlCode] = useState(undefined);

  // Read/write sessionStorage ONLY on the client
  useEffect(() => {
    try {
      if (rawCode) {
        sessionStorage.setItem("guestCode", rawCode);
        setUrlCode(rawCode);
      } else {
        setUrlCode(sessionStorage.getItem("guestCode"));
      }
    } catch {
      setUrlCode(rawCode);
    }
  }, [rawCode]);

  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGuest() {
      if (urlCode === undefined) return;
      if (!urlCode) {
        setLoading(false);
        return;
      }

      try {
        const guestData = await getGuestByUrlCode(urlCode);
        if (cancelled) return;

        if (guestData) {
          setGuest(guestData);
          if (guestData.language) {
            const manuallySet = localStorage.getItem("preferredLanguage");
            if (!manuallySet && guestData.language !== i18n.language) {
              i18n.changeLanguage(guestData.language);
            }
          }
        } else {
          setError("guestNotFound");
        }
      } catch (err) {
        console.error("Error loading guest:", err);
        if (!cancelled) setError("generic");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGuest();
    return () => {
      cancelled = true;
    };
  }, [urlCode, i18n]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo dark:border-pink mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 tracking-widest uppercase text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 font-accent">
              {t("home.subtitle")}
            </p>

            <h1 className="font-cookie text-5xl md:text-7xl lg:text-8xl mb-6 text-gradient leading-normal pb-2">
  {t("home.title")}
</h1>

            <LightsaberDivider color="pink" delay={500} className="my-8" />

            <p
              style={{ fontFamily: "Star Jedi" }}
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 tracking-widest"
            >
              May the Force be with us
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo dark:text-pink" />
                <span>September 5, 2026</span>
              </div>
              <span className="hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo dark:text-pink" />
                <span>Brasília, Brazil</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating hearts */}
        <motion.div
          className="absolute top-20 left-10 text-pink/30"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Heart className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-indigo/30"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Heart className="w-10 h-10" />
        </motion.div>
      </section>

      {/* Personalized or Public Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {guest ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo dark:text-pink">
                {t("home.personalizedWelcome", { name: guest.name })}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {t("home.personalizedMessage")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/rsvp?code=${urlCode}`}
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  {t("home.viewRSVP")}
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Reserved spots:{" "}
                  <span className="font-bold text-indigo dark:text-pink">
                    {guest.reserved_spots}
                  </span>
                </p>
                {guest.rsvp !== null && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    RSVP Status:{" "}
                    <span
                      className={`font-bold ${guest.rsvp ? "text-green-500" : "text-red-500"}`}
                    >
                      {guest.rsvp ? "Confirmed" : "Declined"}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card text-center"
            >
              {error && (
                <div className="text-red-500 mb-4">{t(`errors.${error}`)}</div>
              )}

              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-indigo dark:text-pink">
                Welcome to Our Wedding
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("home.usePersonalLink")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/rsvp"
                  className="btn-primary inline-flex items-center justify-center gap-2"
                >
                  {t("rsvp.loginWithGoogle")}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Wedding Details */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo dark:text-pink">
            The Details
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Church,
                title: "Ceremony",
                content: "Santuário Santo Antônio\n4:30 PM\nBrasília, Brazil",
                link: "https://www.google.com/maps/place/Santuário+Santo+Antônio/data=!4m2!3m1!1s0x0:0x1d5df1a5fdeca27e?sa=X&ved=1t:2428&ictx=111",
              },
              {
                icon: Cake,
                title: "Celebration",
                content: "Porto Cristal Eventos\n7:00 PM\nBrasília, Brazil",
                link: "https://www.google.com/maps/place/Crystal+Harbor+Events/@-15.8506642,-48.0114984,15z/data=!3m1!4b1!4m6!3m5!1s0x935a2e07585aed5b:0x103df11782ca6dfa!8m2!3d-15.8506851!4d-48.0012201!16s%2Fg%2F1s04g97zm?entry=ttu&g_ep=EgoyMDI2MDMyMi4wIKXMDSoASAFQAw%3D%3D",
              },
              {
                icon: Shirt,
                title: "Dress Code",
                content: "Star Wars Black Tie",
                link: null,
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-card text-center transition-transform duration-300 ${
                  item.link ? 'hover:scale-105 cursor-pointer' : ''
                }`}
                onClick={() => item.link && window.open(item.link, '_blank')}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-indigo/10 dark:bg-pink/10">
                    <item.icon className="w-8 h-8 text-indigo dark:text-pink" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {item.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo dark:border-pink mx-auto" />
        <p className="text-gray-600 dark:text-gray-400 tracking-widest uppercase text-sm">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}