"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockCard } from '@/components/stock-card'
import { NewsCard } from '@/components/news-card'
import { InsightsCard } from '@/components/insights-card'
import { StockSearchAutocomplete } from '@/components/stock-search-autocomplete'
import { WatchlistButton } from '@/components/watchlist-button'
import { UserNav } from '@/components/user-nav'
import { MarketHeatmap } from '@/components/market-heatmap'
import { FloatingParticles, HoverGlow } from '@/components/visual-effects'
import Link from 'next/link'

export function DashboardClient() {
  const searchParams = useSearchParams()
  const [searchSymbol, setSearchSymbol] = useState('')
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check URL parameter on mount and when it changes
  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol')
    if (symbolFromUrl) {
      const cleanSymbol = symbolFromUrl.replace('.NS', '').toUpperCase()
      setSelectedStock(cleanSymbol)
      setSearchSymbol(cleanSymbol)
    }
  }, [searchParams])

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      setSelectedStock(searchSymbol.toUpperCase())
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  const handleStockSelect = (symbol: string) => {
    setSearchSymbol(symbol)
    setSelectedStock(symbol.toUpperCase())
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="mobile-container space-y-4 sm:space-y-6 pb-20 md:pb-6 relative">
      <FloatingParticles className="opacity-30" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="mobile-text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Stock Analysis Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 mobile-text-lg">
            AI-powered insights for Indian stock market
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/watchlist" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 mobile-button">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">My Watchlist</span>
              <span className="sm:hidden">Watchlist</span>
            </Button>
          </Link>
          <div className="hidden sm:block">
            <UserNav />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <StockSearchAutocomplete
                value={searchSymbol}
                onChange={setSearchSymbol}
                onSelect={handleStockSelect}
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="gap-2">
              <Search className="h-4 w-4" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="mobile-grid-3">
        <HoverGlow glowColor="#10b981">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-xl font-bold">TATA MOTORS</div>
              <p className="text-xs text-green-600 mt-1">+5.47%</p>
            </CardContent>
          </Card>
        </HoverGlow>

        <HoverGlow glowColor="#ef4444">
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-xl font-bold">WIPRO</div>
              <p className="text-xs text-red-600 mt-1">-3.21%</p>
            </CardContent>
          </Card>
        </HoverGlow>

        <HoverGlow glowColor="#3b82f6">
          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">NIFTY 50</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="mobile-text-xl font-bold">21,456.32</div>
              <p className="text-xs text-green-600 mt-1">+0.78%</p>
            </CardContent>
          </Card>
        </HoverGlow>
      </div>

      {/* Market Heatmap */}
      <MarketHeatmap />

      {/* Selected Stock Analysis */}
      {selectedStock && (
        <div className="space-y-6">
          {/* Stock Header with Watchlist */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analyzing: {selectedStock}</h2>
            <WatchlistButton symbol={selectedStock} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading stock data...</p>
              </CardContent>
            </Card>
          )}

          {/* Stock Data Grid */}
          {!isLoading && (
            <div className="mobile-grid-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Stock Card */}
              <div className="lg:col-span-2">
                <StockCard symbol={selectedStock} />
              </div>

              {/* News Card */}
              <NewsCard symbol={selectedStock} />

              {/* Insights Card */}
              <InsightsCard symbol={selectedStock} />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedStock && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Stock Selected</h3>
            <p className="text-muted-foreground mb-4">
              Search for a stock symbol to view detailed analysis
            </p>
            <p className="text-sm text-muted-foreground">
              Try: RELIANCE, TCS, INFY, HDFCBANK, ICICIBANK
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
