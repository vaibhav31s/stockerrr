import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { stocks } = await request.json()

    if (!stocks || stocks.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 stocks required for comparison' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const stocksData = stocks.map((stock: any, index: number) => `
STOCK ${index + 1}: ${stock.symbol}
- Current Price: ₹${stock.price}
- Change: ${stock.change} (${stock.changePercent}%)
- Market Cap: ₹${stock.marketCap}
- P/E Ratio: ${stock.pe}
- 52W High/Low: ₹${stock.fiftyTwoWeekHigh} / ₹${stock.fiftyTwoWeekLow}
- Volume: ${stock.volume}
- Sector: ${stock.sector || 'N/A'}
`).join('\n')

    const prompt = `As an investment analyst, compare these ${stocks.length} Indian stocks and provide actionable insights:

${stocksData}

Provide a comprehensive comparison in JSON format:

{
  "summary": "Overall comparison summary (2-3 sentences)",
  "rankings": {
    "best_value": "symbol with explanation",
    "best_growth": "symbol with explanation",
    "lowest_risk": "symbol with explanation"
  },
  "comparison": [
    {
      "category": "Valuation",
      "analysis": "comparative analysis",
      "winner": "symbol"
    },
    {
      "category": "Growth Potential",
      "analysis": "comparative analysis",
      "winner": "symbol"
    },
    {
      "category": "Risk Level",
      "analysis": "comparative analysis",
      "winner": "symbol"
    },
    {
      "category": "Market Position",
      "analysis": "comparative analysis",
      "winner": "symbol"
    }
  ],
  "recommendations": {
    "aggressive_investor": "symbol and why",
    "moderate_investor": "symbol and why",
    "conservative_investor": "symbol and why"
  },
  "finalVerdict": "Which stock to choose and why (detailed paragraph)"
}

Base your analysis on the provided metrics and Indian market context.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const comparison = JSON.parse(text)
      return NextResponse.json({
        stocks: stocks.map((s: any) => s.symbol),
        comparison,
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      return NextResponse.json({
        stocks: stocks.map((s: any) => s.symbol),
        comparison: { rawText: text },
        generatedAt: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Error in stock comparison:', error)
    return NextResponse.json(
      { error: 'Failed to compare stocks', details: error.message },
      { status: 500 }
    )
  }
}
