"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Heart, BarChart3, User, Menu, X, TrendingUp, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigationItems = [
    {
      icon: Home,
      label: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      icon: Search,
      label: 'Search',
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      icon: Heart,
      label: 'Watchlist',
      href: '/watchlist',
      active: pathname === '/watchlist'
    },
    {
      icon: BarChart3,
      label: 'Analysis',
      href: '/ai/analysis',
      active: pathname.startsWith('/ai/analysis')
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
      active: pathname === '/profile'
    }
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className={cn("mobile-nav md:hidden", className)}>
        <div className="mobile-nav-content">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-auto py-2 px-3 mobile-button",
                    item.active && "text-primary bg-primary/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Floating Action Button for Quick Actions */}
      <motion.div
        className="fab md:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-24 right-4 z-50 md:hidden"
            >
              <Card className="w-64 shadow-2xl border-2">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Quick Actions</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMenuOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        // Quick search action
                        setIsMenuOpen(false)
                      }}
                    >
                      <Search className="h-5 w-5" />
                      Quick Search
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        // Add to watchlist action
                        setIsMenuOpen(false)
                      }}
                    >
                      <Heart className="h-5 w-5" />
                      Add to Watchlist
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        // Market overview action
                        setIsMenuOpen(false)
                      }}
                    >
                      <Activity className="h-5 w-5" />
                      Market Overview
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12"
                      onClick={() => {
                        // AI insights action
                        setIsMenuOpen(false)
                      }}
                    >
                      <TrendingUp className="h-5 w-5" />
                      AI Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}