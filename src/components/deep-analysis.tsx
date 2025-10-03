'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, Lightbulb, Loader2 } from 'lucide-react'

interface DeepAnalysisProps {
  symbol: string
  stockData: any
  newsData?: any
}

export function DeepAnalysis({ symbol, stockData, newsData }: DeepAnalysisProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyzeStock = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, stockData, newsData })
      })

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingColor = (rating: string) => {
    if (rating === 'BUY') return 'bg-green-500'
    if (rating === 'SELL') return 'bg-red-500'
    return 'bg-yellow-500'
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-500'
    if (score <= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Deep Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive AI-powered investment analysis for {symbol}
            </CardDescription>
          </div>
          <Button onClick={analyzeStock} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Generate Analysis'
            )}
          </Button>
        </div>
      </CardHeader>

      {analysis && (
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="fundamental">Fundamental</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
              <TabsTrigger value="strategy">Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Rating</p>
                  <Badge className={getRatingColor(analysis.overallRating)}>
                    {analysis.overallRating}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Score</p>
                  <p className={`text-2xl font-bold ${getRiskColor(analysis.riskScore)}`}>
                    {analysis.riskScore}/10
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Key Insights
                </h4>
                <ul className="space-y-2">
                  {analysis.keyInsights?.map((insight: string, index: number) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Price Targets</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Short Term</p>
                    <p className="font-semibold">{analysis.priceTargets?.shortTerm}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Medium Term</p>
                    <p className="font-semibold">{analysis.priceTargets?.mediumTerm}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              {analysis.technicalAnalysis && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Trend</p>
                      <p className="font-semibold flex items-center gap-2">
                        {analysis.technicalAnalysis.trend === 'Bullish' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        {analysis.technicalAnalysis.trend}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Momentum</p>
                      <p className="font-semibold">{analysis.technicalAnalysis.momentum}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Support Level</p>
                      <p className="font-semibold">{analysis.technicalAnalysis.support}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Resistance Level</p>
                      <p className="font-semibold">{analysis.technicalAnalysis.resistance}</p>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="fundamental" className="space-y-4">
              {analysis.fundamentalAnalysis && (
                <div className="grid gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Valuation</p>
                    <p className="font-semibold">{analysis.fundamentalAnalysis.valuation}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Financial Health</p>
                    <p className="font-semibold">{analysis.fundamentalAnalysis.financial_health}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Growth Potential</p>
                    <p className="font-semibold">{analysis.fundamentalAnalysis.growth_potential}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {analysis.riskFactors?.map((risk: string, index: number) => (
                    <li key={index} className="flex gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-yellow-500">⚠</span>
                      <span className="text-sm">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  Opportunities
                </h4>
                <ul className="space-y-2">
                  {analysis.opportunities?.map((opp: string, index: number) => (
                    <li key={index} className="flex gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-green-500">✓</span>
                      <span className="text-sm">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Investment Strategy</h4>
                <p className="text-sm leading-relaxed">{analysis.investmentStrategy}</p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                <h4 className="font-semibold mb-2">Conclusion</h4>
                <p className="text-sm leading-relaxed">{analysis.conclusion}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
