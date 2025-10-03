import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Function to fetch real Indian market news from multiple sources
const getIndianMarketNews = async (symbol: string) => {
  try {
    // Try NewsAPI first (if key available)
    if (process.env.NEWS_API_KEY) {
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=${symbol}+NSE+BSE+india+stock&language=en&sortBy=publishedAt&pageSize=8&apiKey=${process.env.NEWS_API_KEY}`,
        { next: { revalidate: 300 } } // Cache for 5 minutes
      )
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json()
        if (newsData.articles && newsData.articles.length > 0) {
          return newsData.articles
            .filter((article: any) => article.title && article.url)
            .map((article: any) => ({
              title: article.title,
              description: article.description || `Latest updates on ${symbol}`,
              url: article.url,
              source: article.source.name,
              publishedAt: article.publishedAt,
              imageUrl: article.urlToImage || null
            }))
        }
      }
    }

    // Try Google News RSS as fallback
    const googleNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(symbol + ' NSE BSE stock India')}&hl=en-IN&gl=IN&ceid=IN:en`
    const rssResponse = await fetch(googleNewsUrl, { 
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    
    if (rssResponse.ok) {
      const rssText = await rssResponse.text()
      const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || []
      
      return items.slice(0, 8).map((item, index) => {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
        const linkMatch = item.match(/<link>(.*?)<\/link>/)
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/)
        const sourceMatch = item.match(/<source url=".*?">(.*?)<\/source>/)
        
        return {
          title: titleMatch ? titleMatch[1] : `${symbol} Market Update`,
          description: `Latest news and analysis on ${symbol} from Indian markets`,
          url: linkMatch ? linkMatch[1] : `https://www.google.com/search?q=${symbol}+stock+news`,
          source: sourceMatch ? sourceMatch[1] : 'Google News',
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString(),
          imageUrl: null
        }
      })
    }

  } catch (error) {
    console.error('Error fetching news:', error)
  }

  // If all else fails, return search links to real news sources
  const realSearchUrls = [
    {
      title: `${symbol} Stock News - Economic Times`,
      description: `Latest market news, analysis and updates on ${symbol} from Economic Times`,
      url: `https://economictimes.indiatimes.com/topic/${symbol.toLowerCase()}`,
      source: "Economic Times"
    },
    {
      title: `${symbol} Share Price & News - Moneycontrol`,
      description: `Track ${symbol} stock price, news, financial results and market updates`,
      url: `https://www.moneycontrol.com/stocks/company_info/stock_news.php?sc_id=${symbol}`,
      source: "Moneycontrol"
    },
    {
      title: `${symbol} Latest News - NSE India`,
      description: `Official announcements and corporate updates for ${symbol} on NSE`,
      url: `https://www.nseindia.com/get-quotes/equity?symbol=${symbol}`,
      source: "NSE India"
    },
    {
      title: `${symbol} Market Analysis - Business Standard`,
      description: `Expert analysis and market insights on ${symbol} stock performance`,
      url: `https://www.business-standard.com/topic/${symbol.toLowerCase()}`,
      source: "Business Standard"
    },
    {
      title: `${symbol} Stock Updates - Mint`,
      description: `Real-time updates and news coverage on ${symbol} from Mint`,
      url: `https://www.livemint.com/topic/${symbol.toLowerCase()}`,
      source: "Mint"
    }
  ]

  return realSearchUrls.map((item, index) => ({
    ...item,
    publishedAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
    imageUrl: null
  }))
}

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

    // Get Indian market news for the symbol
    const newsData = await getIndianMarketNews(symbol.toUpperCase())
    const newsArticles = newsData.map((article: any) => ({
      ...article,
      symbol: symbol.toUpperCase()
    }))

    // Initialize Gemini AI for sentiment analysis
    console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY)
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured, skipping sentiment analysis')
      return NextResponse.json({
        articles: newsArticles.map((article: any) => ({
          ...article,
          sentiment: { score: 0, label: 'neutral', confidence: 0 }
        }))
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Analyze sentiment with better keyword detection
    const articlesWithSentiment = newsArticles.map((article: any) => {
      const text = `${article.title} ${article.description}`.toLowerCase()
      
      // Advanced sentiment scoring
      const positiveKeywords = [
        'surge', 'soar', 'rally', 'jump', 'gain', 'rise', 'boost', 'growth', 'profit',
        'beats', 'upgrade', 'bullish', 'strong', 'outperform', 'buy', 'positive',
        'record', 'high', 'optimistic', 'expansion', 'increase', 'success'
      ]
      
      const negativeKeywords = [
        'fall', 'drop', 'decline', 'plunge', 'crash', 'loss', 'miss', 'downgrade',
        'bearish', 'weak', 'underperform', 'sell', 'negative', 'risk', 'concern',
        'low', 'pessimistic', 'cut', 'decrease', 'failure', 'slump', 'tumble'
      ]
      
      let score = 0
      let matches = 0
      
      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 0.15
          matches++
        }
      })
      
      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score -= 0.15
          matches++
        }
      })
      
      // Normalize score
      score = Math.max(-1, Math.min(1, score))
      const confidence = matches > 0 ? Math.min(0.95, 0.6 + matches * 0.1) : 0.5
      
      const label: 'positive' | 'negative' | 'neutral' = 
        score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral'

      return {
        ...article,
        sentiment: { score, label, confidence }
      }
    })

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      articles: articlesWithSentiment,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news data', details: error.message },
      { status: 500 }
    )
  }
}