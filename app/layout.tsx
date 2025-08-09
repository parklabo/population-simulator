import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Population Simulator | YonYonWare',
  description: 'Visualize demographic futures with real-time birth rate simulations. Created by YonYonWare.',
  authors: [{ name: 'YonYonWare' }],
  creator: 'YonYonWare',
  publisher: 'YonYonWare',
  keywords: ['population', 'simulation', 'demographics', 'birth rate', 'YonYonWare'],
  openGraph: {
    title: 'Population Simulator | YonYonWare',
    description: 'Visualize demographic futures with real-time birth rate simulations',
    url: 'https://population-simulator.park-labs.com',
    siteName: 'Population Simulator',
    images: [
      {
        url: 'https://population-simulator.park-labs.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Population Simulator - Visualize demographic futures',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Population Simulator | YonYonWare',
    description: 'Visualize demographic futures with real-time birth rate simulations',
    creator: '@YoungsuPark6',
    images: ['https://population-simulator.park-labs.com/og-image.svg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}