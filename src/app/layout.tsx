import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth-provider'
import { WatchlistProvider } from '@/contexts/watchlist-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stockkap - AI-Powered Stock Analysis',
  description: 'Real-time stock analysis with AI-powered insights and sentiment analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <WatchlistProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}