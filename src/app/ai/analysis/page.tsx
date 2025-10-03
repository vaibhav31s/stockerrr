'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AIStockChat } from '@/components/ai-stock-chat'
import { DeepAnalysis } from '@/components/deep-analysis'
import { ProtectedRoute } from '@/components/protected-route'
import { Brain, MessageSquare, TrendingUp, Scale, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function AIAnalysisContent() {
  const searchParams = useSearchParams()
  const symbol = searchParams.get('symbol') || ''
  const [stockData, setStockData] = useState<any>(null)
  const [newsData, setNewsData] = useState<any>(null)
  const [riskData, setRiskData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (symbol) {
      fetchStockData()
      fetchNewsData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const fetchStockData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stocks/${symbol}`)
      const data = await response.json()
      setStockData(data)
    } catch (error) {
      console.error('Error fetching stock data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNewsData = async () => {
    try {
      const response = await fetch(`/api/news/${symbol}`)
      const data = await response.json()
      setNewsData(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  const calculateRiskScore = async () => {
    if (!stockData) return

    try {
      const response = await fetch('/api/ai/risk-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, stockData, newsData })
      })

      const data = await response.json()
      setRiskData(data.riskAnalysis)
    } catch (error) {
      console.error('Error calculating risk:', error)
    }
  }

  if (!symbol) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Stock Selected</CardTitle>
            <CardDescription>
              Please select a stock from the dashboard to view AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI-Powered Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive AI insights for {symbol}
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Stock Overview */}
      {stockData && (
        <Card>
          <CardHeader>
            <CardTitle>{stockData.name || symbol}</CardTitle>
            <CardDescription>Current Market Data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold">₹{stockData.price?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Change</p>
                <p className={`text-2xl font-bold ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stockData.changePercent?.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-semibold">₹{(stockData.marketCap / 10000000).toFixed(2)}Cr</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">P/E Ratio</p>
                <p className="text-xl font-semibold">{stockData.pe?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Chat */}
        <AIStockChat symbol={symbol} stockData={stockData} />

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Analysis
                </CardTitle>
                <CardDescription>
                  AI-calculated risk assessment
                </CardDescription>
              </div>
              <Button onClick={calculateRiskScore} disabled={!stockData}>
                Calculate Risk
              </Button>
            </div>
          </CardHeader>
          {riskData && (
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Overall Risk Score</p>
                <p className="text-4xl font-bold">{riskData.overallRiskScore}/100</p>
                <p className="text-lg mt-2">{riskData.riskLevel}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Risk Breakdown</h4>
                <div className="space-y-2">
                  {riskData.riskBreakdown && Object.entries(riskData.riskBreakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm capitalize">{key.replace('Risk', '')}</span>
                      <span className="font-semibold">{value.score}/100</span>
                    </div>
                  ))}
                </div>
              </div>

              {riskData.suitableFor && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Suitable For</h4>
                  <ul className="text-sm space-y-1">
                    {riskData.suitableFor.map((type: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {type}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Deep Analysis */}
      {stockData && (
        <DeepAnalysis symbol={symbol} stockData={stockData} newsData={newsData} />
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>More AI Features</CardTitle>
          <CardDescription>Additional AI-powered tools</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Link href={`/ai/compare?symbols=${symbol}`}>
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Scale className="h-6 w-6" />
              Compare Stocks
            </Button>
          </Link>
          <Link href="/ai/portfolio">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Portfolio Advice
            </Button>
          </Link>
          <Link href={`/ai/insights?symbol=${symbol}`}>
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <MessageSquare className="h-6 w-6" />
              More Insights
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AIAnalysisPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Brain className="h-12 w-12 animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Loading AI Analysis...</p>
            </div>
          </div>
        </div>
      }>
        <AIAnalysisContent />
      </Suspense>
    </ProtectedRoute>
  )
}
