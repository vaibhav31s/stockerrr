'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, ArrowLeft, TrendingUp, Shield, Lightbulb, Target } from 'lucide-react'
import Link from 'next/link'

function InsightsContent() {
  const searchParams = useSearchParams()
  const symbol = searchParams.get('symbol') || ''
  const [insights, setInsights] = useState<any>(null)
  const [newsData, setNewsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (symbol) {
      fetchInsights()
      fetchNews()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  const fetchInsights = async () => {
    setIsLoading(true)
    try {
      const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '')
      const response = await fetch(`/api/insights/${cleanSymbol}`)
      const data = await response.json()
      setInsights(data)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNews = async () => {
    try {
      const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '')
      const response = await fetch(`/api/news/${cleanSymbol}`)
      const data = await response.json()
      setNewsData(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    }
  }

  if (!symbol) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>No Stock Selected</CardTitle>
            <CardDescription>
              Please select a stock to view insights
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
            <Lightbulb className="h-8 w-8" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-2">
            Investment insights for {symbol.replace('.NS', '').replace('.BO', '')}
          </p>
        </div>
        <Link href={`/ai/analysis?symbol=${symbol.replace('.NS', '').replace('.BO', '')}`}>
          <Button>
            <Brain className="mr-2 h-4 w-4" />
            Full AI Analysis
          </Button>
        </Link>
      </div>

      {/* News Sentiment */}
      {newsData && (
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
            <CardDescription>Based on recent news analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{newsData.sentiment}</p>
                <p className="text-sm text-muted-foreground">Overall Sentiment</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{newsData.score}/10</p>
                <p className="text-sm text-muted-foreground">Confidence Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Generating AI insights...</p>
          </CardContent>
        </Card>
      ) : insights ? (
        <Card>
          <CardHeader>
            <CardTitle>Investment Recommendation</CardTitle>
            <CardDescription>AI-powered analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommendation
              </h3>
              <p className="text-lg font-bold">{insights.recommendation}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Key Points</h4>
              <div className="space-y-2">
                {insights.analysis && (
                  <p className="text-sm leading-relaxed">{insights.analysis}</p>
                )}
              </div>
            </div>

            {insights.risks && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <Shield className="h-5 w-5" />
                  Risk Factors
                </h4>
                <p className="text-sm">{insights.risks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No insights available</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Explore More</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Link href={`/ai/analysis?symbol=${symbol.replace('.NS', '').replace('.BO', '')}`}>
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <Brain className="h-6 w-6" />
              Deep AI Analysis
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full h-20 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Lightbulb className="h-12 w-12 animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading insights...</p>
          </div>
        </div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  )
}
