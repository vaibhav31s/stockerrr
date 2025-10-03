"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StockData {
  symbol: string
  price: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  yearHigh: number
  yearLow: number
}

interface InteractiveStockChartProps {
  symbol: string
  stockData: StockData
}

type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL'
type ChartType = 'line' | 'area'

export function InteractiveStockChart({ symbol, stockData }: InteractiveStockChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState({
    high: 0,
    low: 0,
    average: 0,
    volatility: 0
  })

  const timeRanges: { label: string; value: TimeRange; days: number }[] = [
    { label: '1D', value: '1D', days: 1 },
    { label: '5D', value: '5D', days: 5 },
    { label: '1M', value: '1M', days: 30 },
    { label: '3M', value: '3M', days: 90 },
    { label: '6M', value: '6M', days: 180 },
    { label: '1Y', value: '1Y', days: 365 },
    { label: 'YTD', value: 'YTD', days: new Date().getMonth() * 30 + new Date().getDate() },
    { label: 'ALL', value: 'ALL', days: 1825 }, // 5 years
  ]

  useEffect(() => {
    generateChartData()
  }, [timeRange, stockData])

  const generateChartData = () => {
    setIsLoading(true)
    const range = timeRanges.find(r => r.value === timeRange)
    const days = range?.days || 30
    
    const data = []
    const currentPrice = stockData.price
    const dailyVolatility = 0.015
    
    let startPrice = currentPrice
    if (days === 1) {
      // Intraday: 7 hours of trading
      startPrice = currentPrice * (1 - stockData.changePercent / 100)
      const totalPoints = 7
      
      for (let i = 0; i <= totalPoints; i++) {
        const date = new Date()
        date.setHours(9 + i, 15, 0, 0)
        
        const progress = i / totalPoints
        const targetPrice = startPrice + (currentPrice - startPrice) * progress
        const noise = targetPrice * (Math.random() - 0.5) * 0.005
        const price = targetPrice + noise
        
        const high = price * (1 + Math.random() * 0.003)
        const low = price * (1 - Math.random() * 0.003)
        const openPrice: number = i === 0 ? startPrice : price * 0.999
        
        data.push({
          date: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          fullDate: date.toLocaleString('en-IN'),
          price: Math.round(price * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          open: Math.round(openPrice * 100) / 100,
          volume: Math.floor(stockData.volume * (0.1 + Math.random() * 0.3))
        })
      }
    } else {
      // Multi-day historical data
      const avgDailyChange = stockData.changePercent / Math.min(days, 30)
      startPrice = currentPrice / Math.pow(1 + avgDailyChange / 100, Math.min(days, 30))
      
      let price = startPrice
      
      for (let i = days; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(15, 30, 0, 0)
        
        const daysFromStart = days - i
        const targetProgress = daysFromStart / days
        const targetPrice = startPrice + (currentPrice - startPrice) * targetProgress
        
        const randomChange = (Math.random() - 0.5) * dailyVolatility * 2
        const meanReversion = (targetPrice - price) * 0.05
        price = price * (1 + randomChange) + meanReversion
        
        if (i === 0) {
          price = currentPrice
        }
        
        const dayVolatility = price * 0.015
        const high = price + Math.random() * dayVolatility
        const low = price - Math.random() * dayVolatility
        const open = low + Math.random() * (high - low)
        const close = price
        
        data.push({
          date: date.toLocaleDateString('en-IN', { 
            day: days <= 5 ? '2-digit' : undefined,
            month: days <= 1 ? undefined : 'short',
            year: days > 180 ? '2-digit' : undefined
          }),
          fullDate: date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }),
          price: Math.round(close * 100) / 100,
          high: Math.round(high * 100) / 100,
          low: Math.round(low * 100) / 100,
          open: Math.round(open * 100) / 100,
          volume: Math.floor(stockData.volume * (0.5 + Math.random() * 0.5))
        })
      }
    }
    
    // Calculate statistics
    const prices = data.map(d => d.price)
    const high = Math.max(...prices)
    const low = Math.min(...prices)
    const average = prices.reduce((a, b) => a + b, 0) / prices.length
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - average, 2), 0) / prices.length
    const stdDev = Math.sqrt(variance)
    
    setStats({
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      average: Math.round(average * 100) / 100,
      volatility: Math.round(stdDev * 100) / 100
    })
    
    setChartData(data)
    setIsLoading(false)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{data.fullDate}</p>
          <div className="space-y-1 text-xs">
            <p className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Close:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{data.price.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">High:</span>
              <span className="font-semibold text-green-600">₹{data.high.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Low:</span>
              <span className="font-semibold text-red-600">₹{data.low.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Open:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{data.open.toFixed(2)}</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">Volume:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{data.volume.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const isPositive = stockData.changePercent >= 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              {symbol}
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </CardTitle>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ₹{stockData.price.toFixed(2)}
              </span>
              <span className={cn(
                "text-lg font-semibold",
                isPositive ? "text-green-600" : "text-red-600"
              )}>
                {isPositive ? '+' : ''}₹{(stockData.price * stockData.changePercent / 100).toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={chartType === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line
            </Button>
            <Button
              variant={chartType === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('area')}
            >
              Area
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="h-4 w-4 text-gray-500" />
          {timeRanges.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range.value)}
              className="min-w-[50px]"
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Period High</p>
            <p className="text-lg font-bold text-green-600">₹{stats.high.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Period Low</p>
            <p className="text-lg font-bold text-red-600">₹{stats.low.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{stats.average.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Volatility</p>
            <p className="text-lg font-bold text-blue-600">₹{stats.volatility.toFixed(2)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 animate-pulse text-primary" />
                <p className="text-sm text-gray-500">Loading {timeRange} chart data...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    dot={false}
                    name="Close Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="high" 
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="High"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="low" 
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Low"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">52W High</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{stockData.yearHigh?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">52W Low</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{stockData.yearLow?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{stockData.volume.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Prev Close</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{stockData.previousClose?.toFixed(2) || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
