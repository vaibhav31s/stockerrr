"use client"

import { useEffect, useState } from 'react'
import { Brain, Target, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface Insights {
  recommendation: 'Buy' | 'Hold' | 'Sell'
  confidence: number
  targetPrice: number
  keyInsights: string[]
  risks: string[]
  technicalAnalysis: string
  newsImpact: string
  lastUpdated: string
}

interface InsightsData {
  symbol: string
  stockData: any
  insights: Insights
  timestamp: string
}

interface InsightsCardProps {
  symbol: string
}

export function InsightsCard({ symbol }: InsightsCardProps) {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/insights/${symbol}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch insights')
        }
        
        const data = await response.json()
        setInsightsData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchInsights()
    }
  }, [symbol])

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Buy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Sell':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    )
  }

  if (error || !insightsData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {error || 'Unable to generate insights'}
            </p>
            {error?.includes('AI service not configured') && (
              <p className="text-xs text-muted-foreground mt-2">
                Configure GEMINI_API_KEY to enable AI insights
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const { insights } = insightsData

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Insights
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Updated {new Date(insights.lastUpdated).toLocaleTimeString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendation & Target */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Recommendation</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
                    getRecommendationColor(insights.recommendation)
                  }`}>
                    {insights.recommendation}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {(insights.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Price Target</p>
                  <p className="text-2xl font-bold">₹{insights.targetPrice?.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {((insights.targetPrice / insightsData.stockData.price - 1) * 100).toFixed(1)}% 
                    {insights.targetPrice > insightsData.stockData.price ? ' upside' : ' downside'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Insights
          </h4>
          <ul className="space-y-2">
            {insights.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Key Risks
          </h4>
          <ul className="space-y-2">
            {insights.risks.map((risk, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>

        {/* Analysis Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Technical Analysis</h4>
            <p className="text-sm text-muted-foreground">{insights.technicalAnalysis}</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">News Impact</h4>
            <p className="text-sm text-muted-foreground">{insights.newsImpact}</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            * This analysis is generated by AI and should not be considered as financial advice. 
            Always do your own research before making investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}