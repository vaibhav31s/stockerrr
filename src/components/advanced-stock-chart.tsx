"use client"

import { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, BarChart3, Zap, Target, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTouchGestures, useSwipeableCharts } from '@/hooks/use-touch-gestures'
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

interface AdvancedStockChartProps {
  symbol: string
  stockData: StockData
}

type ChartView = 'price' | 'candlestick' | 'volume' | 'indicators' | 'multi'
type TimeRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y'

export function AdvancedStockChart({ symbol, stockData }: AdvancedStockChartProps) {
  const [chartView, setChartView] = useState<ChartView>('price')
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showIndicators, setShowIndicators] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'volume' | 'rsi' | 'macd'>('price')

  const timeRanges = [
    { label: '1D', value: '1D' as TimeRange, days: 1 },
    { label: '5D', value: '5D' as TimeRange, days: 5 },
    { label: '1M', value: '1M' as TimeRange, days: 30 },
    { label: '3M', value: '3M' as TimeRange, days: 90 },
    { label: '6M', value: '6M' as TimeRange, days: 180 },
    { label: '1Y', value: '1Y' as TimeRange, days: 365 },
  ]

  useEffect(() => {
    generateAdvancedChartData()
  }, [timeRange, stockData])

  const generateAdvancedChartData = () => {
    setIsLoading(true)
    const range = timeRanges.find(r => r.value === timeRange)
    const days = range?.days || 30

    const data = []
    const currentPrice = stockData.price
    const dailyVolatility = 0.015

    let price = currentPrice / Math.pow(1 + stockData.changePercent / 100 / Math.min(days, 30), Math.min(days, 30))

    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const daysFromStart = days - i
      const targetProgress = daysFromStart / days
      const targetPrice = currentPrice * (0.8 + targetProgress * 0.4) // More realistic growth pattern

      const randomChange = (Math.random() - 0.5) * dailyVolatility * 2
      const meanReversion = (targetPrice - price) * 0.05
      price = price * (1 + randomChange) + meanReversion

      if (i === 0) price = currentPrice

      const volatility = price * 0.02
      const high = price + Math.random() * volatility
      const low = price - Math.random() * volatility
      const open = low + Math.random() * (high - low)
      const close = price

      // Calculate technical indicators
      const sma20 = calculateSMA(data.slice(-19).map(d => d.close).concat(close), 20)
      const rsi = calculateRSI(data.slice(-13).map(d => d.close).concat(close), 14)
      const macd = calculateMACD(data.slice(-25).map(d => d.close).concat(close))

      data.push({
        date: date.toLocaleDateString('en-IN', {
          day: days <= 5 ? '2-digit' : undefined,
          month: days <= 1 ? undefined : 'short',
          year: days > 180 ? '2-digit' : undefined
        }),
        fullDate: date.toLocaleDateString('en-IN'),
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.floor(stockData.volume * (0.3 + Math.random() * 0.7)),
        sma20: sma20 ? Math.round(sma20 * 100) / 100 : null,
        rsi: rsi ? Math.round(rsi * 100) / 100 : null,
        macd: macd ? Math.round(macd * 100) / 100 : null,
        signal: macd ? Math.round((macd * 0.8) * 100) / 100 : null,
        histogram: macd ? Math.round((macd - (macd * 0.8)) * 100) / 100 : null,
      })
    }

    setChartData(data)
    setIsLoading(false)
  }

  const calculateSMA = (data: any[], period: number) => {
    if (data.length < period) return null
    const sum = data.slice(-period).reduce((acc, d) => acc + d.close, 0)
    return sum / period
  }

  const calculateRSI = (data: any[], period: number) => {
    if (data.length < period + 1) return null

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = data[data.length - i].close - data[data.length - i - 1].close
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  }

  const calculateMACD = (data: any[]) => {
    if (data.length < 26) return null

    const ema12 = calculateEMA(data.slice(-12), 12)
    const ema26 = calculateEMA(data.slice(-26), 26)

    return ema12 - ema26
  }

  const calculateEMA = (data: any[], period: number) => {
    const multiplier = 2 / (period + 1)
    let ema = data[0].close

    for (let i = 1; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema
    }

    return ema
  }

  const CandlestickTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isGreen = data.close >= data.open

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{data.fullDate}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Open</p>
              <p className="font-semibold text-gray-900 dark:text-white">₹{data.open}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Close</p>
              <p className={cn("font-semibold", isGreen ? "text-green-600" : "text-red-600")}>
                ₹{data.close}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">High</p>
              <p className="font-semibold text-green-600">₹{data.high}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Low</p>
              <p className="font-semibold text-red-600">₹{data.low}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 dark:text-gray-400">Volume</p>
              <p className="font-semibold text-blue-600">{data.volume.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
      )
    }
    return null
  }

  const CandlestickBar = (props: any) => {
    const { payload, x, y, width, height } = props
    const { open, close, high, low } = payload
    const isGreen = close >= open

    const centerX = x + width / 2
    const openY = y + height * (high - open) / (high - low)
    const closeY = y + height * (high - close) / (high - low)
    const highY = y
    const lowY = y + height

    return (
      <g>
        {/* High-Low line */}
        <line
          x1={centerX}
          y1={highY}
          x2={centerX}
          y2={lowY}
          stroke={isGreen ? "#10b981" : "#ef4444"}
          strokeWidth={1}
        />
        {/* Open-Close body */}
        <rect
          x={x + width * 0.25}
          y={Math.min(openY, closeY)}
          width={width * 0.5}
          height={Math.abs(closeY - openY)}
          fill={isGreen ? "#10b981" : "#ef4444"}
          stroke={isGreen ? "#10b981" : "#ef4444"}
          strokeWidth={1}
        />
      </g>
    )
  }

  const renderChart = () => {
    const isPositive = stockData.changePercent >= 0

    switch (chartView) {
      case 'candlestick':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `₹${value}`} />
              <Tooltip content={<CandlestickTooltip />} />
              <Bar dataKey="high" shape={<CandlestickBar />} />
              {showIndicators && (
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="SMA(20)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value: any) => [`${value.toLocaleString()}`, 'Volume']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'indicators':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis yAxisId="rsi" orientation="right" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis yAxisId="macd" orientation="left" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line yAxisId="rsi" type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} dot={false} name="RSI(14)" />
              <Line yAxisId="macd" type="monotone" dataKey="macd" stroke="#f59e0b" strokeWidth={2} dot={false} name="MACD" />
              <Line yAxisId="macd" type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Signal" />
              <Bar yAxisId="macd" dataKey="histogram" fill="#10b981" name="Histogram" />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'multi':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis yAxisId="price" orientation="left" tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `₹${value}`} />
              <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip />
              <Legend />
              <Area yAxisId="price" type="monotone" dataKey="close" stroke={isPositive ? "#10b981" : "#ef4444"} fill={isPositive ? "#10b981" : "#ef4444"} fillOpacity={0.1} name="Price" />
              <Bar yAxisId="volume" dataKey="volume" fill="#3b82f6" fillOpacity={0.3} name="Volume" />
              {showIndicators && (
                <>
                  <Line yAxisId="price" type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="SMA(20)" />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )

      default: // price
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                formatter={(value: any) => [`₹${value}`, 'Close Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area type="monotone" dataKey="close" stroke={isPositive ? "#10b981" : "#ef4444"} strokeWidth={2} fill="url(#colorPrice)" />
              {showIndicators && (
                <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )
    }
  }

  const isPositive = stockData.changePercent >= 0

  const chartViews = [
    { id: 'price', label: 'Price', icon: TrendingUp },
    { id: 'candlestick', label: 'Candlestick', icon: BarChart3 },
    { id: 'volume', label: 'Volume', icon: Activity },
    { id: 'indicators', label: 'Indicators', icon: Zap },
    { id: 'multi', label: 'Multi', icon: Target },
  ]

  // Touch gestures for mobile navigation
  const swipeHandlers = useSwipeableCharts(
    chartViews.map(v => v.id),
    chartView,
    (view) => setChartView(view as ChartView)
  )

  const touchRef = useTouchGestures({
    ...swipeHandlers,
    onTap: () => {
      // Toggle indicators on tap
      setShowIndicators(!showIndicators)
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIndicators(!showIndicators)}
                className="gap-2"
              >
                {showIndicators ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                Indicators
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Chart Type Selector */}
          <div className="flex flex-wrap gap-2">
            {chartViews.map((view) => {
              const Icon = view.icon
              return (
                <motion.div
                  key={view.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={chartView === view.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartView(view.id as ChartView)}
                    className="gap-2 min-w-[100px]"
                  >
                    <Icon className="h-4 w-4" />
                    {view.label}
                  </Button>
                </motion.div>
              )
            })}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <Activity className="h-4 w-4 text-gray-500" />
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

          {/* Chart */}
          <div ref={touchRef as React.RefObject<HTMLDivElement>} className="mobile-chart h-[400px] sm:h-[500px] w-full touch-manipulation">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex flex-col items-center gap-2"
                >
                  <Activity className="h-8 w-8 text-primary" />
                  <p className="text-sm text-gray-500">Loading {chartView} chart...</p>
                </motion.div>
              </div>
            ) : (
              renderChart()
            )}
          </div>

          {/* Technical Indicators Legend */}
          {showIndicators && chartView !== 'volume' && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Badge variant="outline" className="gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded"></div>
                SMA(20)
              </Badge>
              {chartView === 'indicators' && (
                <>
                  <Badge variant="outline" className="gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    RSI(14)
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded"></div>
                    MACD
                  </Badge>
                  <Badge variant="outline" className="gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded border-dashed"></div>
                    Signal
                  </Badge>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}