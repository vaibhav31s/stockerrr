import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { message, context, stockData } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Build context-aware prompt
    let prompt = `You are an expert stock market analyst and investment advisor for Indian markets (NSE/BSE). 
You provide clear, actionable insights based on data and market trends.

User Question: ${message}
`

    if (stockData) {
      prompt += `\nCurrent Stock Data:
Symbol: ${stockData.symbol}
Price: ₹${stockData.price}
Change: ${stockData.change} (${stockData.changePercent}%)
Market Cap: ₹${stockData.marketCap}
P/E Ratio: ${stockData.pe}
52-Week High: ₹${stockData.fiftyTwoWeekHigh}
52-Week Low: ₹${stockData.fiftyTwoWeekLow}
`
    }

    if (context && context.length > 0) {
      prompt += `\nConversation History:\n${context.map((msg: any) => 
        `${msg.role}: ${msg.content}`
      ).join('\n')}\n`
    }

    prompt += `\nProvide a detailed, professional response focusing on:
- Data-driven insights
- Risk assessment
- Entry/exit points if applicable
- Market sentiment
- Key factors to watch

Keep your response concise but informative (max 300 words).`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({
      response: text,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error in AI chat:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error.message },
      { status: 500 }
    )
  }
}
