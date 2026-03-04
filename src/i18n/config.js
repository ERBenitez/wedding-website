import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslations from './locales/en.json'
import esTranslations from './locales/es.json'
import ptTranslations from './locales/pt.json'

const resources = {
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  pt: {
    translation: ptTranslations
  }
}

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: isBrowser ? ['localStorage', 'navigator', 'htmlTag'] : ['navigator', 'htmlTag'],
      caches: isBrowser ? ['localStorage'] : [],
    },
    
    react: {
      useSuspense: false,
    },
  })

export default i18n
