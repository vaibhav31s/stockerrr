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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt = `Analyze this group of ${category} stocks: ${stocks.map((s: any) => s.symbol).join(', ')}

Please provide:
1. **Sector Overview**: Brief analysis of the ${category} sector in the current market
2. **Top Performers**: Which stocks in this list are showing strength and why
3. **Underperformers**: Which stocks need attention or might be risky
4. **Diversification**: Is this a well-diversified group within ${category}?
5. **Sector-Specific Risks**: What are the key risks for ${category} sector right now
6. **Investment Strategy**: Short recommendation for this group (Hold/Buy More/Reduce/Rebalance)
7. **Key Metrics to Watch**: Important indicators for these ${category} stocks

Keep it concise and actionable. Format with clear sections.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const analysis = response.text()

    return NextResponse.json({
      category,
      stockCount: stocks.length,
      analysis,
      stocks: stocks.map((s: any) => s.symbol)
    })
  } catch (error) {
    console.error('Error analyzing category:', error)
    return NextResponse.json(
      { error: 'Failed to analyze category' },
      { status: 500 }
    )
  }
}
