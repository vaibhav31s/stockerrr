"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WatchlistContextType {
  watchlist: string[]
  addToWatchlist: (symbol: string) => void
  removeFromWatchlist: (symbol: string) => void
  isInWatchlist: (symbol: string) => boolean
  clearWatchlist: () => void
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>([])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('stockkap-watchlist')
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading watchlist:', error)
      }
    }
  }, [])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockkap-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const addToWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      if (!prev.includes(symbol.toUpperCase())) {
        return [...prev, symbol.toUpperCase()]
      }
      return prev
    })
  }

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol.toUpperCase()))
  }

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase())
  }

  const clearWatchlist = () => {
    setWatchlist([])
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        clearWatchlist
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}
