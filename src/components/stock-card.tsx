"use client"

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InteractiveStockChart } from '@/components/interactive-stock-chart'
import { AdvancedStockChart } from '@/components/advanced-stock-chart'
import { HoverGlow } from '@/components/visual-effects'
import Link from 'next/link'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  exchange: string
  currency: string
  timestamp: string
}

interface StockCardProps {
  symbol: string
}

export function StockCard({ symbol }: StockCardProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/stocks/${symbol}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data')
        }
        
        const data = await response.json()
        setStockData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchStockData()
    }
  }, [symbol])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-24" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    )
  }

  if (error || !stockData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {error || 'Unable to load stock data'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = stockData.change > 0

  return (
    <div className="space-y-6">
      {/* Advanced Interactive Chart */}
      <AdvancedStockChart 
        symbol={stockData.symbol}
        stockData={{
          symbol: stockData.symbol,
          price: stockData.price,
          changePercent: stockData.changePercent,
          volume: stockData.volume,
          high: stockData.fiftyTwoWeekHigh,
          low: stockData.fiftyTwoWeekLow,
          open: stockData.price * 0.99, // Approximate
          previousClose: stockData.price - stockData.change,
          yearHigh: stockData.fiftyTwoWeekHigh,
          yearLow: stockData.fiftyTwoWeekLow
        }}
      />
      
      {/* Additional Stock Info Card */}
      <HoverGlow glowColor={isPositive ? "#10b981" : "#ef4444"}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{stockData.name}</h3>
                <p className="text-sm text-muted-foreground">{stockData.exchange}</p>
              </div>
              <Link href={`/ai/analysis?symbol=${stockData.symbol}`}>
                <Button variant="default" className="gap-2">
                  <Brain className="h-4 w-4" />
                  AI Analysis
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                </div>
                <p className="font-medium">
                  ₹{stockData.marketCap ? (stockData.marketCap / 10000000).toFixed(0) + ' Cr' : 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">P/E Ratio</span>
                </div>
                <p className="font-medium">{stockData.pe?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </HoverGlow>
    </div>
  )
}