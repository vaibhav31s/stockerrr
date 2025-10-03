import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { symbol, stockData, newsData } = await request.json()

    if (!symbol || !stockData) {
      return NextResponse.json(
        { error: 'Symbol and stock data are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `As an expert stock analyst, provide a COMPREHENSIVE investment analysis for ${symbol} (Indian stock market).

CURRENT DATA:
- Price: ₹${stockData.price}
- Change: ${stockData.change} (${stockData.changePercent}%)
- Day Range: ₹${stockData.dayLow} - ₹${stockData.dayHigh}
- 52-Week Range: ₹${stockData.fiftyTwoWeekLow} - ₹${stockData.fiftyTwoWeekHigh}
- Volume: ${stockData.volume}
- Market Cap: ₹${stockData.marketCap}
- P/E Ratio: ${stockData.pe}
- EPS: ${stockData.eps}
${newsData ? `\nRECENT NEWS SENTIMENT: ${newsData.sentiment} (${newsData.score}/10)` : ''}

Provide a detailed analysis in JSON format with these sections:

{
  "overallRating": "BUY/HOLD/SELL",
  "riskScore": 0-10,
  "technicalAnalysis": {
    "trend": "Bullish/Bearish/Neutral",
    "support": "support price level",
    "resistance": "resistance price level",
    "momentum": "description"
  },
  "fundamentalAnalysis": {
    "valuation": "Overvalued/Fair/Undervalued",
    "financial_health": "Strong/Moderate/Weak",
    "growth_potential": "High/Medium/Low"
  },
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "riskFactors": ["risk 1", "risk 2", "risk 3"],
  "opportunities": ["opportunity 1", "opportunity 2"],
  "priceTargets": {
    "shortTerm": "1-3 months target",
    "mediumTerm": "6-12 months target"
  },
  "investmentStrategy": "detailed strategy paragraph",
  "conclusion": "final recommendation paragraph"
}

Ensure all analysis is based on the provided data and Indian market context.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const analysis = JSON.parse(text)
      return NextResponse.json({
        symbol,
        analysis,
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      // If JSON parsing fails, return as text
      return NextResponse.json({
        symbol,
        analysis: { rawText: text },
        generatedAt: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Error in deep analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis', details: error.message },
      { status: 500 }
    )
  }
}
