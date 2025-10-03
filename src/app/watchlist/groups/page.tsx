'use client'

import { useEffect, useState } from 'react'
import { useWatchlist } from '@/contexts/watchlist-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Tag,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface GroupedWatchlist {
  grouped: Record<string, any[]>
  categories: string[]
  totalStocks: number
}

interface CategoryAnalysis {
  category: string
  stockCount: number
  analysis: string
  stocks: string[]
}

const categoryColors: Record<string, string> = {
  'Banking': 'bg-blue-100 text-blue-800 border-blue-300',
  'Technology': 'bg-purple-100 text-purple-800 border-purple-300',
  'IT Services': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Pharmaceuticals': 'bg-green-100 text-green-800 border-green-300',
  'Energy': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Automobile': 'bg-red-100 text-red-800 border-red-300',
  'FMCG': 'bg-orange-100 text-orange-800 border-orange-300',
  'Other': 'bg-gray-100 text-gray-800 border-gray-300'
}

export default function WatchlistGroupsPage() {
  const { watchlist, loading: watchlistLoading } = useWatchlist()
  const [grouped, setGrouped] = useState<GroupedWatchlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [categorizing, setCategorizing] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<Record<string, CategoryAnalysis>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchGrouped()
  }, [watchlist])

  const fetchGrouped = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/watchlist/groups')
      const data = await response.json()
      setGrouped(data)
    } catch (error) {
      console.error('Error fetching grouped watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoCategorize = async () => {
    try {
      setCategorizing(true)
      const response = await fetch('/api/watchlist/groups', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        await fetchGrouped()
      }
    } catch (error) {
      console.error('Error categorizing:', error)
    } finally {
      setCategorizing(false)
    }
  }

  const handleAnalyzeCategory = async (category: string, stocks: any[]) => {
    try {
      setAnalyzing(category)
      setSelectedCategory(category)
      
      const response = await fetch('/api/watchlist/analyze-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, stocks })
      })
      
      const data = await response.json()
      setAnalysis(prev => ({ ...prev, [category]: data }))
    } catch (error) {
      console.error('Error analyzing category:', error)
    } finally {
      setAnalyzing(null)
    }
  }

  if (loading || watchlistLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/watchlist">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Watchlist Groups
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Analyze your stocks by category
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleAutoCategorize} 
            disabled={categorizing}
            variant="outline"
          >
            {categorizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Categorizing...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Auto-Categorize
              </>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Stocks</p>
                  <p className="text-2xl font-bold">{grouped?.totalStocks || 0}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold">{grouped?.categories.length || 0}</p>
                </div>
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Analyzed</p>
                  <p className="text-2xl font-bold">{Object.keys(analysis).length}</p>
                </div>
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory || 'all'} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            {grouped?.categories.slice(0, 3).map(cat => (
              <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped?.categories.map(category => {
                const stocks = grouped.grouped[category]
                const colorClass = categoryColors[category] || categoryColors['Other']
                
                return (
                  <Card key={category} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Badge className={colorClass}>
                            {category}
                          </Badge>
                        </CardTitle>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stocks.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {stocks.slice(0, 5).map((stock: any) => (
                          <Badge key={stock.id} variant="outline">
                            {stock.symbol}
                          </Badge>
                        ))}
                        {stocks.length > 5 && (
                          <Badge variant="outline">+{stocks.length - 5}</Badge>
                        )}
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={() => handleAnalyzeCategory(category, stocks)}
                        disabled={analyzing === category}
                      >
                        {analyzing === category ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze {category}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {grouped?.categories.map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={categoryColors[category] || categoryColors['Other']}>
                      {category}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-400">
                      ({grouped.grouped[category].length} stocks)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock List */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {grouped.grouped[category].map((stock: any) => (
                      <Link key={stock.id} href={`/dashboard?symbol=${stock.symbol}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 w-full justify-center py-2">
                          {stock.symbol}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  {/* Analysis */}
                  {analysis[category] ? (
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Analysis
                      </h3>
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{analysis[category].analysis}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleAnalyzeCategory(category, grouped.grouped[category])}
                      disabled={analyzing === category}
                    >
                      {analyzing === category ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze This Category
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
