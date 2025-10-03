import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    console.log('Category chat API called')
    
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log('Unauthorized: No session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', { 
      hasMessage: !!body.message, 
      category: body.category,
      stockCount: body.stocks?.length,
      hasAnalysis: !!body.analysis,
      hasStockDetails: !!body.stockDetails
    })

    const { message, category, analysis, stocks, stockDetails, conversationHistory } = body

    if (!message || !category) {
      console.log('Missing required fields:', { message: !!message, category: !!category })
      return NextResponse.json({ error: 'Message and category required' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      console.error('GEMINI_API_KEY or GOOGLE_API_KEY not configured')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Build context from conversation history
    const historyContext = conversationHistory?.map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n') || ''

    // Build stock details context
    const stockDetailsContext = stockDetails?.map((s: any) => `
**${s.symbol}:**
- Current: ₹${s.currentPrice} (${s.changePercent}%)
- 3M Range: ₹${s.threeMonthLow} - ₹${s.threeMonthHigh}
- 52W Range: ₹${s.yearLow} - ₹${s.yearHigh}
- P/E: ${s.pe}, Beta: ${s.beta}
- Risk: ${s.riskScore} (${s.riskFactors})
`).join('\n') || ''

    console.log('Calling Gemini API...')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `You are an expert investment advisor helping analyze a ${category} portfolio.

**PREVIOUS ANALYSIS:**
${analysis}

**STOCK DATA:**
${stockDetailsContext || `Stocks: ${stocks.join(', ')}`}

**CONVERSATION HISTORY:**
${historyContext}

**USER QUESTION:**
${message}

**INSTRUCTIONS:**
- Answer based on the analysis and stock data provided above
- Be specific with stock symbols, prices, and metrics
- Give actionable recommendations with price targets when asked
- If asked about entry/exit points, use the actual price data
- If asked about risks, refer to the risk scores and factors
- Keep responses concise but informative
- Use bullet points and formatting for clarity
- If you don't have enough data to answer, say so clearly

Respond in a conversational, helpful tone. Use the actual data to support your recommendations.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const aiResponse = response.text()

    console.log('AI response generated successfully, length:', aiResponse.length)

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Category chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
