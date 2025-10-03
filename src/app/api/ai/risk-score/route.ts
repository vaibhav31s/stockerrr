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

    const prompt = `As a risk analyst, calculate a comprehensive risk score for ${symbol}:

STOCK DATA:
- Current Price: ₹${stockData.price}
- Volatility: ${stockData.changePercent}%
- Market Cap: ₹${stockData.marketCap}
- P/E Ratio: ${stockData.pe}
- 52W Range: ₹${stockData.fiftyTwoWeekLow} - ₹${stockData.fiftyTwoWeekHigh}
- Volume: ${stockData.volume}
${newsData ? `\nNews Sentiment: ${newsData.sentiment} (${newsData.score}/10)` : ''}

Calculate risk score (0-100, where 0=lowest risk, 100=highest risk) based on:

Provide analysis in JSON format:

{
  "overallRiskScore": 0-100,
  "riskLevel": "Very Low/Low/Moderate/High/Very High",
  "riskBreakdown": {
    "volatilityRisk": {
      "score": 0-100,
      "assessment": "explanation"
    },
    "valuationRisk": {
      "score": 0-100,
      "assessment": "explanation"
    },
    "liquidityRisk": {
      "score": 0-100,
      "assessment": "explanation"
    },
    "marketRisk": {
      "score": 0-100,
      "assessment": "explanation"
    },
    "sentimentRisk": {
      "score": 0-100,
      "assessment": "explanation"
    }
  },
  "keyRisks": [
    {
      "type": "risk type",
      "severity": "Low/Medium/High",
      "description": "detailed description",
      "mitigation": "how to mitigate"
    }
  ],
  "suitableFor": ["Conservative investors", "Moderate investors", "Aggressive investors"],
  "notSuitableFor": ["investor types who should avoid"],
  "riskMitigationStrategies": ["strategy 1", "strategy 2", "strategy 3"],
  "conclusion": "Overall risk assessment paragraph"
}

Be thorough and consider Indian market volatility.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const riskAnalysis = JSON.parse(text)
      return NextResponse.json({
        symbol,
        riskAnalysis,
        generatedAt: new Date().toISOString()
      })
    } catch (parseError) {
      return NextResponse.json({
        symbol,
        riskAnalysis: { rawText: text },
        generatedAt: new Date().toISOString()
      })
    }
  } catch (error: any) {
    console.error('Error in risk score calculation:', error)
    return NextResponse.json(
      { error: 'Failed to calculate risk score', details: error.message },
      { status: 500 }
    )
  }
}
