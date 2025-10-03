"use client"

import { useEffect, useState } from 'react'
import { Star, TrendingUp, TrendingDown, Trash2, ArrowLeft, Calendar, Tag } from 'lucide-react'
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

interface PeriodSummary {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  gainers: number
  losers: number
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y'

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist()
  const [stocks, setStocks] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1D')
  const [periodData, setPeriodData] = useState<Map<string, number>>(new Map())
  const [useRealData, setUseRealData] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const periods: { value: TimePeriod; label: string; days: number }[] = [
    { value: '1D', label: '1 Day', days: 1 },
    { value: '1W', label: '1 Week', days: 7 },
    { value: '1M', label: '1 Month', days: 30 },
    { value: '3M', label: '3 Months', days: 90 },
    { value: '6M', label: '6 Months', days: 180 },
    { value: '1Y', label: '1 Year', days: 365 },
  ]

  // Auto-sync function: checks if today's data exists, syncs if missing
  const autoSyncTodayData = async (symbols: string[]) => {
    if (symbols.length === 0) return

    try {
      // Check if today's snapshot exists
      const checkResponse = await fetch(`/api/stocks/snapshot?symbols=${symbols.join(',')}`)
      const checkData = await checkResponse.json()

      if (checkData.needsSync) {
        console.log('Today\'s data missing, auto-syncing...', checkData.missingSymbols)
        setSyncing(true)
        
        // Sync missing data
        const syncResponse = await fetch('/api/stocks/snapshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: checkData.missingSymbols })
        })

        const syncResult = await syncResponse.json()
        console.log('Auto-sync completed:', syncResult)
        setSyncing(false)
        
        return true
      }

      console.log('Today\'s data already exists')
      return false
    } catch (error) {
      console.error('Auto-sync error:', error)
      setSyncing(false)
      return false
    }
  }

  // Fetch historical data from database
  const fetchHistoricalData = async (symbol: string, daysAgo: number) => {
    try {
      const response = await fetch(`/api/stocks/historical?symbol=${symbol}&daysAgo=${daysAgo}`)
      const data = await response.json()
      
      if (data.found) {
        return data.price
      }
      return null
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error)
      return null
    }
  }

  // Calculate historical price based on selected period
  const calculateHistoricalPrice = (currentPrice: number, changePercent: number, days: number) => {
    // Simulate historical data - in production, you'd fetch real historical data
    // This creates a reasonable estimate based on the current day's trend
    
    if (days === 1) {
      // For 1 day, use the actual change
      return currentPrice / (1 + changePercent / 100)
    }
    
    // For longer periods, extrapolate with some randomness
    // Assume average daily volatility of 1-2%
    const avgDailyVolatility = 0.01 + Math.random() * 0.01
    
    // Calculate a random walk over the period
    let simulatedChange = 0
    for (let i = 0; i < days; i++) {
      // Random daily change between -avgDailyVolatility and +avgDailyVolatility
      const dailyChange = (Math.random() - 0.5) * 2 * avgDailyVolatility
      simulatedChange += dailyChange
    }
    
    // Bias the random walk slightly toward the current trend
    const trendBias = changePercent > 0 ? 0.2 : -0.2
    const totalChange = (simulatedChange * 100 + trendBias) * (days / 30) // Scale by days
    
    // Ensure we don't get unrealistic values (cap at ±50%)
    const cappedChange = Math.max(-50, Math.min(50, totalChange))
    
    return currentPrice / (1 + cappedChange / 100)
  }

  // Calculate period summary
  const calculatePeriodSummary = (): PeriodSummary => {
    if (stocks.length === 0) {
      return { totalValue: 0, totalGainLoss: 0, totalGainLossPercent: 0, gainers: 0, losers: 0 }
    }

    const selectedPeriodConfig = periods.find(p => p.value === selectedPeriod)!
    let totalValue = 0
    let totalGainLoss = 0
    let gainers = 0
    let losers = 0

    stocks.forEach(stock => {
      // For 1D, use the actual change from the API
      let gainLoss: number
      let gainLossPercent: number
      
      if (selectedPeriod === '1D') {
        gainLoss = stock.change
        gainLossPercent = stock.changePercent
      } else {
        const historicalPrice = periodData.get(stock.symbol) || 
          calculateHistoricalPrice(stock.price, stock.changePercent, selectedPeriodConfig.days)
        
        gainLoss = stock.price - historicalPrice
        gainLossPercent = ((stock.price - historicalPrice) / historicalPrice) * 100
      }

      totalValue += stock.price
      totalGainLoss += gainLoss

      if (gainLossPercent > 0) gainers++
      else if (gainLossPercent < 0) losers++
    })

    const totalGainLossPercent = totalGainLoss !== 0 
      ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 
      : 0

    return { totalValue, totalGainLoss, totalGainLossPercent, gainers, losers }
  }

  const summary = calculatePeriodSummary()

  useEffect(() => {
    const fetchWatchlistStocks = async () => {
      if (watchlist.length === 0) {
        setStocks([])
        setLoading(false)
        return
      }

      setLoading(true)
      
      // Auto-sync today's data if missing
      await autoSyncTodayData(watchlist)
      
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
        const validStocks = results.filter(Boolean)
        setStocks(validStocks)
        
        // Try to fetch real historical data from database first
        const selectedPeriodConfig = periods.find(p => p.value === selectedPeriod)!
        const newPeriodData = new Map<string, number>()
        let hasRealData = false
        
        await Promise.all(
          validStocks.map(async (stock) => {
            if (selectedPeriod !== '1D') {
              // Try to get real historical data from database
              const historicalPrice = await fetchHistoricalData(
                stock.symbol, 
                selectedPeriodConfig.days
              )
              
              if (historicalPrice) {
                newPeriodData.set(stock.symbol, historicalPrice)
                hasRealData = true
              } else {
                // Fallback to simulated data if no real data available
                const simulatedPrice = calculateHistoricalPrice(
                  stock.price, 
                  stock.changePercent, 
                  selectedPeriodConfig.days
                )
                newPeriodData.set(stock.symbol, simulatedPrice)
              }
            }
          })
        )
        
        setPeriodData(newPeriodData)
        setUseRealData(hasRealData)
      } catch (error) {
        console.error('Error fetching watchlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlistStocks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchlist, selectedPeriod])

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
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
                  {syncing && (
                    <span className="text-blue-600 text-xs">• Syncing today&apos;s data...</span>
                  )}
                  {useRealData && !syncing && (
                    <span className="text-green-600 text-xs">• Using real historical data</span>
                  )}
                  {!useRealData && selectedPeriod !== '1D' && !syncing && (
                    <span className="text-orange-600 text-xs">• Using simulated data</span>
                  )}
                </p>
              </div>
            </div>
            {watchlist.length > 0 && (
              <div className="flex gap-2">
                <Link href="/watchlist/groups">
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    By Category
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (watchlist.length > 0) {
                      setSyncing(true)
                      try {
                        const response = await fetch('/api/stocks/snapshot', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ symbols: watchlist })
                        })
                        const result = await response.json()
                        console.log('Manual sync result:', result)
                        alert(`Synced ${result.saved || 0} stocks successfully!`)
                      } catch (error) {
                        console.error('Sync error:', error)
                        alert('Failed to sync data')
                      } finally {
                        setSyncing(false)
                      }
                    }
                  }}
                  disabled={syncing}
                >
                  {syncing ? 'Syncing...' : 'Sync Today\'s Data'}
                </Button>
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
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Period Toggle & Summary Card */}
        {watchlist.length > 0 && (
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Performance Summary
                  </CardTitle>
                  {selectedPeriod !== '1D' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      useRealData 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {useRealData ? '✓ Real Data' : '⚠ Simulated'}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {periods.map((period) => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value)}
                      className="min-w-[60px] text-xs sm:text-sm"
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                    <p className="text-2xl font-bold">₹{summary.totalValue.toFixed(2)}</p>
                  </div>
                  <div className={`text-center p-4 rounded-lg ${
                    summary.totalGainLoss >= 0 
                      ? 'bg-green-50 dark:bg-green-950' 
                      : 'bg-red-50 dark:bg-red-950'
                  }`}>
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedPeriod} Gain/Loss
                    </p>
                    <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${
                      summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {summary.totalGainLoss >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      {summary.totalGainLoss >= 0 ? '+' : '-'}₹{Math.abs(summary.totalGainLoss).toFixed(2)}
                    </p>
                    <p className={`text-sm ${
                      summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({summary.totalGainLoss >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <p className="text-sm text-muted-foreground mb-1">Gainers</p>
                    <p className="text-2xl font-bold text-green-600">
                      {summary.gainers}/{stocks.length}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                    <p className="text-sm text-muted-foreground mb-1">Losers</p>
                    <p className="text-2xl font-bold text-red-600">
                      {summary.losers}/{stocks.length}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stock List */}
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
              const selectedPeriodConfig = periods.find(p => p.value === selectedPeriod)!
              
              // For 1D, use the actual change from the API
              let periodGainLoss: number
              let periodGainLossPercent: number
              
              if (selectedPeriod === '1D') {
                periodGainLoss = stock.change
                periodGainLossPercent = stock.changePercent
              } else {
                const historicalPrice = periodData.get(stock.symbol) || stock.price
                periodGainLoss = stock.price - historicalPrice
                periodGainLossPercent = historicalPrice !== stock.price 
                  ? ((stock.price - historicalPrice) / historicalPrice) * 100 
                  : 0
              }
              
              const isPeriodPositive = periodGainLoss >= 0

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
                          <div className={`flex items-center gap-1 text-sm font-semibold ${
                            isPeriodPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isPeriodPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {isPeriodPositive ? '+' : ''}₹{Math.abs(periodGainLoss).toFixed(2)} ({isPeriodPositive ? '+' : ''}{periodGainLossPercent.toFixed(2)}%)
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedPeriod} Performance
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
                            onClick={async () => await removeFromWatchlist(stock.symbol)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
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
                      <div>
                        <span className="text-muted-foreground">{selectedPeriod} Change:</span>
                        <span className={`ml-2 font-bold ${isPeriodPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPeriodPositive ? '+' : ''}{periodGainLossPercent.toFixed(2)}%
                        </span>
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
