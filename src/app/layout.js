import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Dancing_Script, Open_Sans, Cookie } from 'next/font/google'

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: ['400', '500', '600', '700']
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['300', '400', '500', '600', '700']
})

const cookie = Cookie({
  subsets: ['latin'],
  variable: '--font-cookie',
  weight: ['400']
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Olívia & Esteban | A Star Wars Wedding',
  description: 'Join us on our journey to a galaxy far, far away...',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${cookie.variable} ${dancingScript.variable} ${openSans.variable} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col relative">
            {/* Global background - covers all pages */}
            <div className="fixed inset-0 -z-10 site-gradient" />
            <div className="fixed inset-0 -z-10 starfield-bg opacity 10" />
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}