import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getLanguageName(code) {
  const languages = {
    en: 'English',
    es: 'Español',
    pt: 'Português'
  }
  return languages[code] || code
}

export function getLanguageFlag(code) {
  const flags = {
    en: '🇨🇦',
    es: '🇸🇻',
    pt: '🇧🇷'
  }
  return flags[code] || '🌐'
}
