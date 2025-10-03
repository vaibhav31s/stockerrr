"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface WatchlistItem {
  id: string
  symbol: string
  addedPrice?: number | null
  targetPrice?: number | null
  stopLoss?: number | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

interface WatchlistContextType {
  watchlist: string[]
  watchlistItems: WatchlistItem[]
  addToWatchlist: (symbol: string, addedPrice?: number) => Promise<void>
  removeFromWatchlist: (symbol: string) => Promise<void>
  isInWatchlist: (symbol: string) => boolean
  clearWatchlist: () => Promise<void>
  loading: boolean
  error: string | null
  refreshWatchlist: () => Promise<void>
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrated, setMigrated] = useState(false)

  // Migrate localStorage data to database
  const migrateLocalStorageData = async () => {
    try {
      const saved = localStorage.getItem('stockkap-watchlist')
      if (!saved) return

      const symbols = JSON.parse(saved)
      if (!Array.isArray(symbols) || symbols.length === 0) return

      console.log('Migrating localStorage watchlist to database:', symbols)

      const response = await fetch('/api/watchlist/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Migration completed:', result)
        // Clear localStorage after successful migration
        localStorage.removeItem('stockkap-watchlist')
        setMigrated(true)
      }
    } catch (error) {
      console.error('Error migrating localStorage data:', error)
    }
  }

  // Fetch watchlist from database
  const fetchWatchlist = async () => {
    if (status !== 'authenticated' || !session) {
      // If not authenticated, try to load from localStorage as fallback
      try {
        const saved = localStorage.getItem('stockkap-watchlist')
        if (saved) {
          const parsed = JSON.parse(saved)
          setWatchlist(parsed)
          setWatchlistItems([])
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Migrate localStorage data if user just logged in
      if (!migrated) {
        await migrateLocalStorageData()
      }

      const response = await fetch('/api/watchlist')
      
      if (!response.ok) {
        throw new Error('Failed to fetch watchlist')
      }

      const data = await response.json()
      const items = data.watchlist.items || []
      
      setWatchlistItems(items)
      setWatchlist(items.map((item: WatchlistItem) => item.symbol))
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  // Load watchlist when session changes
  useEffect(() => {
    fetchWatchlist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session])

  const addToWatchlist = async (symbol: string, addedPrice?: number) => {
    const upperSymbol = symbol.toUpperCase()

    // Optimistic update
    setWatchlist(prev => {
      if (!prev.includes(upperSymbol)) {
        return [...prev, upperSymbol]
      }
      return prev
    })

    if (status !== 'authenticated' || !session) {
      // Save to localStorage if not authenticated
      try {
        const saved = localStorage.getItem('stockkap-watchlist')
        const current = saved ? JSON.parse(saved) : []
        if (!current.includes(upperSymbol)) {
          localStorage.setItem('stockkap-watchlist', JSON.stringify([...current, upperSymbol]))
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
      return
    }

    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: upperSymbol, addedPrice })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to watchlist')
      }

      // Refresh to get updated data
      await fetchWatchlist()
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to add to watchlist')
      // Revert optimistic update
      setWatchlist(prev => prev.filter(s => s !== upperSymbol))
    }
  }

  const removeFromWatchlist = async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()

    // Optimistic update
    setWatchlist(prev => prev.filter(s => s !== upperSymbol))
    setWatchlistItems(prev => prev.filter(item => item.symbol !== upperSymbol))

    if (status !== 'authenticated' || !session?.user?.email) {
      // Remove from localStorage if not authenticated
      try {
        const saved = localStorage.getItem('stockkap-watchlist')
        if (saved) {
          const current = JSON.parse(saved)
          localStorage.setItem('stockkap-watchlist', JSON.stringify(current.filter((s: string) => s !== upperSymbol)))
        }
      } catch (error) {
        console.error('Error removing from localStorage:', error)
      }
      return
    }

    try {
      const response = await fetch(`/api/watchlist/${upperSymbol}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove from watchlist')
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove from watchlist')
      // Revert optimistic update
      await fetchWatchlist()
    }
  }

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol.toUpperCase())
  }

  const clearWatchlist = async () => {
    // Optimistic update
    setWatchlist([])
    setWatchlistItems([])

    if (status !== 'authenticated' || !session) {
      // Clear localStorage if not authenticated
      try {
        localStorage.removeItem('stockkap-watchlist')
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
      return
    }

    try {
      const response = await fetch('/api/watchlist', {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to clear watchlist')
      }
    } catch (error) {
      console.error('Error clearing watchlist:', error)
      setError(error instanceof Error ? error.message : 'Failed to clear watchlist')
      // Revert optimistic update
      await fetchWatchlist()
    }
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watchlistItems,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        clearWatchlist,
        loading,
        error,
        refreshWatchlist: fetchWatchlist
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
