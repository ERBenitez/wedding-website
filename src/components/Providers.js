'use client'

import { ThemeProvider } from 'next-themes'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { SupabaseProvider } from '@/contexts/SupabaseContext'

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <I18nextProvider i18n={i18n}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </I18nextProvider>
    </ThemeProvider>
  )
}
