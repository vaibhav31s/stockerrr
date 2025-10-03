"use client"

import { useEffect, useState } from 'react'
import { Star, TrendingUp, TrendingDown, Trash2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWatchlist } from '@/contexts/watchlist-context'
import Link from 'next/link'

interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
}

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWatchlistStocks = async () => {
      if (watchlist.length === 0) {
        setStocks([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const promises = watchlist.map(async (symbol) => {
          try {
            const response = await fetch(`/api/stocks/${symbol}`)
            if (response.ok) {
              return await response.json()
            }
            return null
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error)
            return null
          }
        })

        const results = await Promise.all(promises)
        setStocks(results.filter(Boolean))
      } catch (error) {
        console.error('Error fetching watchlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlistStocks()
  }, [watchlist])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                  My Watchlist
                </h1>
                <p className="text-sm text-muted-foreground">
                  {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
                </p>
              </div>
            </div>
            {watchlist.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire watchlist?')) {
                    clearWatchlist()
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Star className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
              <p className="text-muted-foreground text-center mb-6">
                Add stocks to your watchlist to track them easily
              </p>
              <Link href="/dashboard">
                <Button>
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="grid gap-4">
            {watchlist.map((symbol) => (
              <Card key={symbol}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24" />
                      <div className="h-6 bg-gray-200 rounded w-32" />
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {stocks.map((stock) => {
              const isPositive = stock.changePercent >= 0

              return (
                <Card key={stock.symbol} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="text-lg font-bold">{stock.symbol}</h3>
                            <p className="text-sm text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{stock.price.toFixed(2)}</div>
                          <div className={`flex items-center gap-1 text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            ₹{Math.abs(stock.change).toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/dashboard?symbol=${stock.symbol}`}>
                            <Button variant="default" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWatchlist(stock.symbol)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="ml-2 font-medium">{stock.volume.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Market Cap:</span>
                        <span className="ml-2 font-medium">
                          {stock.marketCap ? `₹${(stock.marketCap / 10000000).toFixed(0)} Cr` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">P/E:</span>
                        <span className="ml-2 font-medium">{stock.pe?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
