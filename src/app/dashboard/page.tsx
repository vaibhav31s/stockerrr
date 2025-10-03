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
import Link from 'next/link'

export default function DashboardPage() {
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchSymbol.trim()) return
    
    setIsLoading(true)
    setSelectedStock(searchSymbol.toUpperCase())
    setIsLoading(false)
  }

  const popularIndianStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL']

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Stockkap Dashboard</h1>
              <p className="text-sm text-muted-foreground">Indian Stock Market Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/watchlist">
                <Button variant="outline">Watchlist</Button>
              </Link>
              <Button variant="outline">Settings</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <StockSearchAutocomplete
                value={searchSymbol}
                onChange={setSearchSymbol}
                onSelect={(symbol) => setSelectedStock(symbol)}
                placeholder="Search by symbol or company name (e.g., RELIANCE, TCS)"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Searching...' : 'Analyze'}
              </Button>
            </form>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Popular Indian stocks:</p>
              <div className="flex flex-wrap gap-2">
                {popularIndianStocks.map((stock) => (
                  <Button
                    key={stock}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchSymbol(stock)
                      setSelectedStock(stock)
                    }}
                  >
                    {stock}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Open</div>
              <p className="text-xs text-muted-foreground">
                NSE & BSE trading hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nifty 50</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22,150</div>
              <p className="text-xs text-green-600">+0.8% today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sensex</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">73,120</div>
              <p className="text-xs text-green-600">+0.6% today</p>
            </CardContent>
          </Card>
        </div>

        {/* Stock Analysis */}
        {selectedStock && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedStock}</h2>
              <WatchlistButton symbol={selectedStock} />
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <StockCard symbol={selectedStock} />
              <NewsCard symbol={selectedStock} />
            </div>
            <InsightsCard symbol={selectedStock} />
          </div>
        )}

        {!selectedStock && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Search for an Indian stock to get started</h3>
                <p className="text-muted-foreground">
                  Enter an Indian stock symbol above to view real-time NSE/BSE data, news, and AI-powered insights.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}