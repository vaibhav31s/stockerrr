import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { portfolio, riskProfile, investmentGoal } = await request.json()

    if (!portfolio || portfolio.length === 0) {
      return NextResponse.json(
        { error: 'Portfolio data is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const portfolioData = portfolio.map((stock: any) => `
- ${stock.symbol}: ₹${stock.price} (${stock.changePercent}% change)
  Market Cap: ₹${stock.marketCap}, P/E: ${stock.pe}
`).join('\n')

    const totalValue = portfolio.reduce((sum: number, stock: any) => sum + (stock.price * (stock.quantity || 1)), 0)

    const prompt = `As a portfolio manager, analyze this Indian stock portfolio and provide optimization recommendations:

PORTFOLIO (Total Value: ₹${totalValue.toLocaleString('en-IN')}):
${portfolioData}

INVESTOR PROFILE:
- Risk Tolerance: ${riskProfile || 'Moderate'}
- Investment Goal: ${investmentGoal || 'Long-term wealth creation'}

Provide comprehensive portfolio advice in JSON format:

{
  "portfolioHealth": {
    "score": 0-10,
    "rating": "Excellent/Good/Fair/Poor",
    "summary": "overall assessment"
  },
  "diversification": {
    "score": 0-10,
    "analysis": "diversification analysis",
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "riskAssessment": {
    "overallRisk": "Low/Medium/High",
    "riskFactors": ["factor 1", "factor 2"],
    "hedgingStrategies": ["strategy 1", "strategy 2"]
  },
  "rebalancing": {
    "needed": true/false,
    "recommendations": [
      {
        "action": "Reduce/Increase/Hold",
        "symbol": "stock symbol",
        "reason": "explanation",
        "targetAllocation": "percentage"
      }
    ]
  },
  "addToWatchlist": [
    {
      "symbol": "suggested stock",
      "reason": "why to add",
      "sector": "sector name"
    }
  ],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "actionPlan": "Step-by-step plan to optimize portfolio (detailed paragraph)"
}

Consider Indian market conditions and the investor's risk profile.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const advice = JSON.parse(text)
      return NextResponse.json({
        portfolio: portfolio.map((s: any) => s.symbol),
        totalValue,
        advice,
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      return NextResponse.json({
        portfolio: portfolio.map((s: any) => s.symbol),
        totalValue,
        advice: { rawText: text },
        generatedAt: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Error in portfolio advice:', error)
    return NextResponse.json(
      { error: 'Failed to generate portfolio advice', details: error.message },
      { status: 500 }
    )
  }
}
