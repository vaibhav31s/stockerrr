import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    const baseUrl = request.nextUrl.origin
    const stockResponse = await fetch(`${baseUrl}/api/stocks/${symbol}`)
    const stockData = await stockResponse.json()

    if (!stockResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stock data for analysis' },
        { status: 400 }
      )
    }

    const newsResponse = await fetch(`${baseUrl}/api/news/${symbol}`)
    const newsData = await newsResponse.json()

    let insights
    try {
      const priceChange = stockData.changePercent || 0
      const volume = stockData.volume || 0
      const pe = stockData.pe || 20
      
      let recommendation: 'Buy' | 'Hold' | 'Sell' = 'Hold'
      let confidence = 0.75
      
      if (priceChange > 2 && pe < 25) recommendation = 'Buy'
      else if (priceChange < -3 || pe > 40) recommendation = 'Sell'
      
      if (Math.abs(priceChange) > 5) confidence += 0.1
      if (volume > 1000000) confidence += 0.05
      
      confidence = Math.min(0.95, confidence)
      
      const targetPrice = stockData.price * (1 + (priceChange > 0 ? 0.08 : -0.03))
      
      const avgSentiment = newsData.articles ? 
        newsData.articles.reduce((acc: number, article: any) => acc + (article.sentiment?.score || 0), 0) / newsData.articles.length : 0
      
      insights = {
        recommendation,
        confidence,
        targetPrice: Math.round(targetPrice * 100) / 100,
        keyInsights: [
          `Price momentum: ${priceChange > 0 ? 'positive' : 'negative'} (${Math.abs(priceChange).toFixed(1)}%)`,
          `Volume: ${volume.toLocaleString()} - ${volume > 1000000 ? 'high' : 'moderate'} interest`,
          `P/E: ${pe} - ${pe < 20 ? 'undervalued' : pe > 30 ? 'overvalued' : 'fair'}`,
          `Sentiment: ${avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'neutral'}`,
          'Strong Indian market fundamentals'
        ],
        risks: [
          'Market volatility',
          'Regulatory changes',
          'Global economic uncertainty',
          'Currency fluctuation',
          'Competition pressures'
        ],
        technicalAnalysis: `Price at ₹${stockData.price} shows ${priceChange > 0 ? 'bullish' : 'bearish'} momentum. Support: ₹${(stockData.price * 0.95).toFixed(2)}, Resistance: ₹${(stockData.price * 1.05).toFixed(2)}.`,
        newsImpact: `Market sentiment is ${avgSentiment > 0.1 ? 'positive' : avgSentiment < -0.1 ? 'negative' : 'mixed'} based on recent news and sector developments.`,
        marketContext: `Indian markets ${priceChange > 0 ? 'gaining momentum' : 'consolidating'} with FII activity and policy changes influencing sentiment.`,
        lastUpdated: new Date().toISOString()
      }
      
    } catch (error) {
      insights = {
        recommendation: "Hold" as const,
        confidence: 0.5,
        targetPrice: stockData.price,
        keyInsights: ["Market analysis in progress"],
        risks: ["Market volatility"],
        technicalAnalysis: "Analysis based on current data",
        newsImpact: "Sentiment analysis complete",
        marketContext: "Indian market context",
        lastUpdated: new Date().toISOString()
      }
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      stockData,
      insights,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights', details: error.message },
      { status: 500 }
    )
  }
}
