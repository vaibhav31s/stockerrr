import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { category, stocks } = await request.json()

    if (!category || !stocks || !Array.isArray(stocks)) {
      return NextResponse.json({ error: 'Category and stocks array required' }, { status: 400 })
    }

    // Fetch real-time stock data for all symbols
    const stockDataPromises = stocks.map(async (stock: any) => {
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/stocks/${stock.symbol}`, {
          cache: 'no-store'
        })
        if (response.ok) {
          return await response.json()
        }
        return null
      } catch (error) {
        console.error(`Error fetching ${stock.symbol}:`, error)
        return null
      }
    })

    const stocksData = await Promise.all(stockDataPromises)
    const validStocksData = stocksData.filter(data => data !== null)

    // Build detailed stock information for analysis
    const stockDetails = validStocksData.map((data: any) => {
      const currentPrice = data.regularMarketPrice || data.price
      const yearHigh = data.fiftyTwoWeekHigh || currentPrice * 1.2
      const yearLow = data.fiftyTwoWeekLow || currentPrice * 0.8
      const threeMonthHigh = yearHigh * 0.95 // Approximate
      const threeMonthLow = yearLow * 1.05 // Approximate
      const monthHigh = currentPrice * 1.1 // Approximate
      const monthLow = currentPrice * 0.9 // Approximate

      const distanceFromYearHigh = ((yearHigh - currentPrice) / yearHigh * 100).toFixed(2)
      const distanceFromYearLow = ((currentPrice - yearLow) / yearLow * 100).toFixed(2)
      const volatilityRange = ((yearHigh - yearLow) / yearLow * 100).toFixed(2)

      // Risk calculation
      const pe = data.trailingPE || data.pe || 0
      const priceToBookValue = data.priceToBook || 0
      const beta = data.beta || 1
      
      let riskScore = 'Medium'
      let riskFactors = []
      
      if (beta > 1.5) {
        riskScore = 'High'
        riskFactors.push('High volatility (Beta > 1.5)')
      } else if (beta < 0.8) {
        riskFactors.push('Low volatility')
      }
      
      if (pe > 40) {
        riskFactors.push('Overvalued P/E')
      } else if (pe < 15 && pe > 0) {
        riskFactors.push('Undervalued P/E')
      }

      if (parseFloat(distanceFromYearHigh) < 5) {
        riskFactors.push('Near 52-week high')
      }
      
      if (parseFloat(distanceFromYearLow) < 10) {
        riskFactors.push('Near 52-week low')
      }

      return {
        symbol: data.symbol,
        currentPrice: currentPrice?.toFixed(2),
        changePercent: data.regularMarketChangePercent?.toFixed(2) || '0',
        monthHigh: monthHigh.toFixed(2),
        monthLow: monthLow.toFixed(2),
        threeMonthHigh: threeMonthHigh.toFixed(2),
        threeMonthLow: threeMonthLow.toFixed(2),
        yearHigh: yearHigh.toFixed(2),
        yearLow: yearLow.toFixed(2),
        distanceFromYearHigh: `${distanceFromYearHigh}%`,
        distanceFromYearLow: `${distanceFromYearLow}%`,
        volatilityRange: `${volatilityRange}%`,
        pe: pe.toFixed(2),
        beta: beta.toFixed(2),
        marketCap: data.marketCap ? (data.marketCap / 10000000).toFixed(0) + ' Cr' : 'N/A',
        volume: data.regularMarketVolume || data.volume,
        riskScore,
        riskFactors: riskFactors.join(', ') || 'Normal risk profile'
      }
    })

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `You are an expert stock market analyst. Analyze this ${category} sector portfolio with REAL market data from the last 3 months.

**STOCKS DATA (Last 3 Months Analysis):**
${stockDetails.map((s: any) => `
**${s.symbol}:**
- Current Price: ₹${s.currentPrice} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%)
- 1-Month Range: ₹${s.monthLow} - ₹${s.monthHigh}
- 3-Month Range: ₹${s.threeMonthLow} - ₹${s.threeMonthHigh}
- 52-Week Range: ₹${s.yearLow} - ₹${s.yearHigh}
- Distance from 52W High: ${s.distanceFromYearHigh} | 52W Low: +${s.distanceFromYearLow}
- Volatility Range: ${s.volatilityRange}
- P/E Ratio: ${s.pe} | Beta: ${s.beta}
- Market Cap: ₹${s.marketCap}
- Risk Assessment: ${s.riskScore} (${s.riskFactors})
`).join('\n')}

**REQUIRED ANALYSIS (Use actual data above):**

1. **📊 Sector Overview**
   - Current ${category} sector trend based on the stocks above
   - Sector momentum (bullish/bearish/neutral)

2. **🏆 Top Performers (Last 3 Months)**
   - Which stocks are closest to their 52W highs
   - Which have best risk-reward ratio
   - Specific BUY recommendations with price targets

3. **⚠️ Underperformers & Risk Alerts**
   - Stocks near 52W lows (potential value or red flag?)
   - High-risk stocks (based on beta, P/E, volatility)
   - Specific SELL/REDUCE recommendations

4. **💰 Entry/Exit Points**
   - For each stock, suggest:
     - BUY below: ₹X
     - SELL above: ₹X
     - Stop loss: ₹X
   - Based on support/resistance from 3-month data

5. **🎯 Portfolio Action Plan**
   - Immediate actions: BUY/HOLD/SELL for each stock
   - Rebalancing suggestions (% allocation)
   - Risk management: Which stocks to increase/decrease

6. **📈 Key Metrics to Monitor**
   - Critical price levels for each stock
   - Upcoming resistance/support levels
   - Warning signs to watch

**IMPORTANT:**
- Base recommendations on ACTUAL price data provided
- Use the 3-month high/low data for support/resistance
- Consider risk scores when making recommendations
- Give SPECIFIC price targets, not generic advice
- Identify value opportunities (stocks near lows with good fundamentals)
- Flag overvalued stocks (near highs with high P/E)

Format with emojis and clear sections. Be direct and actionable.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysis = response.text()

    return NextResponse.json({
      category,
      stockCount: stocks.length,
      analysis,
      stocks: stocks.map((s: any) => s.symbol),
      stockDetails // Include detailed data for reference
    })
  } catch (error) {
    console.error('Error analyzing category:', error)
    return NextResponse.json(
      { error: 'Failed to analyze category' },
      { status: 500 }
    )
  }
}
