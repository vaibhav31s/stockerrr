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
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    if (!isClient) return
    
    try {
      const saved = localStorage.getItem('stockkap-watchlist')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('Loaded watchlist from localStorage:', parsed)
        setWatchlist(parsed)
      }
    } catch (error) {
      console.error('Error loading watchlist:', error)
    }
  }, [isClient])

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return
    
    try {
      if (watchlist.length === 0) {
        localStorage.removeItem('stockkap-watchlist')
        console.log('Removed empty watchlist from localStorage')
      } else {
        localStorage.setItem('stockkap-watchlist', JSON.stringify(watchlist))
        console.log('Saved watchlist to localStorage:', watchlist)
      }
    } catch (error) {
      console.error('Error saving watchlist:', error)
    }
  }, [watchlist, isClient])

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
    if (isClient) {
      try {
        localStorage.removeItem('stockkap-watchlist')
        console.log('Cleared watchlist from localStorage')
      } catch (error) {
        console.error('Error clearing watchlist:', error)
      }
    }
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
