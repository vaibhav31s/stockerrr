"use client"

import { useEffect, useState } from 'react'
import { Newspaper, TrendingUp, TrendingDown, AlertCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  imageUrl?: string
  sentiment: {
    score: number
    label: 'positive' | 'negative' | 'neutral'
    confidence: number
  }
}

interface NewsData {
  symbol: string
  articles: NewsArticle[]
  timestamp: string
}

interface NewsCardProps {
  symbol: string
}

export function NewsCard({ symbol }: NewsCardProps) {
  const [newsData, setNewsData] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/news/${symbol}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch news data')
        }
        
        const data = await response.json()
        setNewsData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchNewsData()
    }
  }, [symbol])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />
      case 'negative':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date()
    const published = new Date(publishedAt)
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours === 1) return '1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return '1 day ago'
    return `${diffInDays} days ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error || !newsData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {error || 'Unable to load news data'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const overallSentiment = newsData.articles.reduce((acc, article) => acc + article.sentiment.score, 0) / newsData.articles.length
  const sentimentLabel = overallSentiment > 0.1 ? 'positive' : overallSentiment < -0.1 ? 'negative' : 'neutral'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            News & Sentiment
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSentimentColor(sentimentLabel)}>
              {getSentimentIcon(sentimentLabel)}
              <span className="ml-1 capitalize">{sentimentLabel}</span>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Overall market sentiment: <span className="font-medium">{(overallSentiment * 100).toFixed(1)}% {sentimentLabel}</span>
        </div>
        
        <div className="space-y-4">
          {newsData.articles.slice(0, 4).map((article, index) => (
            <div 
              key={index} 
              className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0 hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors"
              onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
            >
              <div className="space-y-2">
                <h4 
                  className="font-medium text-sm leading-5 hover:text-blue-600 cursor-pointer"
                  onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
                >
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSentimentColor(article.sentiment.label)}`}
                    >
                      {getSentimentIcon(article.sentiment.label)}
                      <span className="ml-1">{(article.sentiment.score * 100).toFixed(0)}%</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{article.source}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeAgo(article.publishedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            News sources: Economic Times, Moneycontrol, Business Today, Mint, Financial Express
          </p>
        </div>
      </CardContent>
    </Card>
  )
}