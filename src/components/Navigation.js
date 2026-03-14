"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useSupabase } from "@/contexts/SupabaseContext";
import { Moon, Sun, Menu, X, Globe, LogOut, User } from "lucide-react";
import { getLanguageFlag, getLanguageName } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme(); // resolvedTheme is never undefined
  const { user, signOut } = useSupabase();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const langMenuRef = useRef(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    try {
      const code = sessionStorage.getItem("guestCode");
      setHasAccess(!!code || !!user);
    } catch {
      setHasAccess(!!user);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  }, [i18n]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = ["en", "es", "pt"];

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/brasilia", label: t("navigation.brasilia") },
    ...(hasAccess ? [{ href: "/rsvp", label: t("navigation.rsvp") }] : []),
  ];

  const isActive = (href) => pathname === href;

  const isDark = resolvedTheme === "dark";

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gradient font-display">
              O & E
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-indigo dark:text-pink"
                    : "text-gray-700 dark:text-gray-300 hover:text-indigo dark:hover:text-pink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span suppressHydrationWarning>
                  {mounted ? getLanguageFlag(i18n.language) : "🌐"}
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => changeLanguage(lang)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        i18n.language === lang
                          ? "text-indigo dark:text-pink font-medium"
                          : ""
                      }`}
                    >
                      <span className="mr-2">{getLanguageFlag(lang)}</span>
                      {getLanguageName(lang)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={t("navigation.theme")}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gold" />
              ) : (
                <Moon className="w-5 h-5 text-indigo" />
              )}
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 inline mr-1" />
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
                  title={t("common.logout")}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="md:hidden overflow-hidden ..."
          >
            <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <div className="px-4 py-4 space-y-4">
                {/* Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-base font-medium ${
                      isActive(link.href)
                        ? "text-indigo dark:text-pink"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                  {/* Language Selector */}
                  <div className="flex gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => changeLanguage(lang)}
                        className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                          i18n.language === lang
                            ? "border-indigo dark:border-pink text-indigo dark:text-pink"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {getLanguageFlag(lang)}
                      </button>
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>

                  {/* User Menu */}
                  {user && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {user.email}
                      </p>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("common.logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
