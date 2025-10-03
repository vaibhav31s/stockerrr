"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity, Zap, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectorData {
  sector: string
  performance: number
  stocks: Array<{
    symbol: string
    name: string
    change: number
    price: number
  }>
}

interface HeatmapData {
  symbol: string
  sector: string
  performance: number
  correlation: number
  volume: number
}

export function MarketHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [sectorData, setSectorData] = useState<SectorData[]>([])
  const [viewMode, setViewMode] = useState<'sectors' | 'correlations'>('sectors')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    generateHeatmapData()
  }, [])

  const generateHeatmapData = () => {
    setIsLoading(true)

    // Mock data for major Indian market sectors and stocks
    const sectors = [
      'IT', 'Banking', 'Pharma', 'Auto', 'Energy', 'FMCG', 'Metal', 'Realty'
    ]

    const stocks = [
      { symbol: 'TCS', sector: 'IT', basePrice: 3200 },
      { symbol: 'INFY', sector: 'IT', basePrice: 1400 },
      { symbol: 'HCLTECH', sector: 'IT', basePrice: 1200 },
      { symbol: 'WIPRO', sector: 'IT', basePrice: 400 },
      { symbol: 'HDFCBANK', sector: 'Banking', basePrice: 1600 },
      { symbol: 'ICICIBANK', sector: 'Banking', basePrice: 900 },
      { symbol: 'SBIN', sector: 'Banking', basePrice: 600 },
      { symbol: 'AXISBANK', sector: 'Banking', basePrice: 950 },
      { symbol: 'SUNPHARMA', sector: 'Pharma', basePrice: 1200 },
      { symbol: 'DRREDDY', sector: 'Pharma', basePrice: 5800 },
      { symbol: 'CIPLA', sector: 'Pharma', basePrice: 1100 },
      { symbol: 'MARUTI', sector: 'Auto', basePrice: 9500 },
      { symbol: 'TATAMOTORS', sector: 'Auto', basePrice: 650 },
      { symbol: 'BAJAJ-AUTO', sector: 'Auto', basePrice: 4800 },
      { symbol: 'RELIANCE', sector: 'Energy', basePrice: 2500 },
      { symbol: 'ONGC', sector: 'Energy', basePrice: 180 },
      { symbol: 'NTPC', sector: 'Energy', basePrice: 220 },
      { symbol: 'HINDUNILVR', sector: 'FMCG', basePrice: 2400 },
      { symbol: 'ITC', sector: 'FMCG', basePrice: 380 },
      { symbol: 'NESTLEIND', sector: 'FMCG', basePrice: 19500 },
      { symbol: 'TATASTEEL', sector: 'Metal', basePrice: 120 },
      { symbol: 'JSWSTEEL', sector: 'Metal', basePrice: 650 },
      { symbol: 'DLF', sector: 'Realty', basePrice: 480 },
      { symbol: 'GODREJPROP', sector: 'Realty', basePrice: 1800 },
    ]

    const generatedData: HeatmapData[] = stocks.map(stock => {
      const performance = (Math.random() - 0.5) * 10 // -5% to +5%
      const correlation = Math.random() * 2 - 1 // -1 to 1
      const volume = Math.floor(Math.random() * 10000000) + 1000000

      return {
        symbol: stock.symbol,
        sector: stock.sector,
        performance,
        correlation,
        volume
      }
    })

    // Calculate sector performance
    const sectorPerformance = sectors.map(sector => {
      const sectorStocks = generatedData.filter(d => d.sector === sector)
      const avgPerformance = sectorStocks.reduce((sum, stock) => sum + stock.performance, 0) / sectorStocks.length

      return {
        sector,
        performance: avgPerformance,
        stocks: sectorStocks.slice(0, 3).map(s => ({
          symbol: s.symbol,
          name: s.symbol,
          change: s.performance,
          price: Math.floor(Math.random() * 5000) + 100
        }))
      }
    })

    setHeatmapData(generatedData)
    setSectorData(sectorPerformance)
    setIsLoading(false)
  }

  const getHeatmapColor = (value: number, type: 'performance' | 'correlation') => {
    if (type === 'performance') {
      if (value >= 3) return 'bg-green-500'
      if (value >= 1) return 'bg-green-400'
      if (value >= -1) return 'bg-yellow-400'
      if (value >= -3) return 'bg-red-400'
      return 'bg-red-500'
    } else {
      // Correlation colors
      const abs = Math.abs(value)
      if (abs >= 0.7) return value > 0 ? 'bg-blue-600' : 'bg-purple-600'
      if (abs >= 0.4) return value > 0 ? 'bg-blue-400' : 'bg-purple-400'
      return 'bg-gray-300'
    }
  }

  const getIntensity = (value: number, type: 'performance' | 'correlation') => {
    if (type === 'performance') {
      return Math.min(Math.abs(value) / 5 * 100, 100)
    } else {
      return Math.abs(value) * 100
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading market heatmap...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Market Heatmap
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'sectors' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('sectors')}
              >
                Sectors
              </Button>
              <Button
                variant={viewMode === 'correlations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('correlations')}
              >
                Correlations
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            {viewMode === 'sectors'
              ? 'Real-time sector performance and top stocks'
              : 'Stock correlation matrix showing market relationships'
            }
          </p>
        </CardHeader>

        <CardContent>
          {viewMode === 'sectors' ? (
            <div className="space-y-6">
              {/* Sector Performance Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sectorData.map((sector, index) => (
                  <motion.div
                    key={sector.sector}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "p-4 transition-all duration-300 hover:shadow-lg",
                      sector.performance >= 0
                        ? "border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
                        : "border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
                    )}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{sector.sector}</h4>
                          {sector.performance >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="text-2xl font-bold">
                          {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(1)}%
                        </div>
                        <div className="space-y-1">
                          {sector.stocks.slice(0, 2).map((stock) => (
                            <div key={stock.symbol} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{stock.symbol}</span>
                              <span className={cn(
                                "font-medium",
                                stock.change >= 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Top Performers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Top Gainers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {heatmapData
                        .sort((a, b) => b.performance - a.performance)
                        .slice(0, 5)
                        .map((stock, index) => (
                          <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-950"
                          >
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{stock.sector}</div>
                            </div>
                            <Badge className="bg-green-600">
                              +{stock.performance.toFixed(1)}%
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      Top Losers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {heatmapData
                        .sort((a, b) => a.performance - b.performance)
                        .slice(0, 5)
                        .map((stock, index) => (
                          <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950"
                          >
                            <div>
                              <div className="font-medium">{stock.symbol}</div>
                              <div className="text-sm text-muted-foreground">{stock.sector}</div>
                            </div>
                            <Badge variant="destructive">
                              {stock.performance.toFixed(1)}%
                            </Badge>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Correlation Matrix */
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header row with stock symbols */}
                  <div className="flex mb-2">
                    <div className="w-20 flex-shrink-0"></div>
                    {heatmapData.slice(0, 10).map((stock) => (
                      <div key={stock.symbol} className="w-12 text-center text-xs font-medium">
                        {stock.symbol.substring(0, 4)}
                      </div>
                    ))}
                  </div>

                  {/* Correlation matrix rows */}
                  {heatmapData.slice(0, 10).map((rowStock, rowIndex) => (
                    <div key={rowStock.symbol} className="flex items-center mb-1">
                      <div className="w-20 text-xs font-medium text-right pr-2">
                        {rowStock.symbol}
                      </div>
                      {heatmapData.slice(0, 10).map((colStock, colIndex) => {
                        const correlation = rowIndex === colIndex ? 1 :
                          (Math.sin(rowIndex * colIndex * 0.1) * 0.5 + 0.5) * (Math.random() > 0.3 ? 1 : -1)

                        return (
                          <motion.div
                            key={colStock.symbol}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: (rowIndex * 10 + colIndex) * 0.01 }}
                            className={cn(
                              "w-12 h-8 rounded-sm border cursor-pointer transition-all duration-200 hover:scale-110",
                              getHeatmapColor(correlation, 'correlation')
                            )}
                            style={{
                              opacity: getIntensity(correlation, 'correlation') / 100 + 0.2
                            }}
                            title={`${rowStock.symbol} vs ${colStock.symbol}: ${(correlation * 100).toFixed(0)}%`}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Correlation Legend */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-sm">Strong Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-sm">Moderate Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-sm">Weak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-400 rounded"></div>
                  <span className="text-sm">Moderate Negative</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span className="text-sm">Strong Negative</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}