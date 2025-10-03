import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

// Helper function to determine stock category based on symbol
function getCategoryFromSymbol(symbol: string): string {
  const bankStocks = ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK', 'PNB', 'BANKBARODA']
  const techStocks = ['TCS', 'INFY', 'WIPRO', 'TECHM', 'HCLTECH', 'LTI', 'MINDTREE', 'COFORGE']
  const pharmaStocks = ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'LUPIN', 'AUROPHARMA', 'BIOCON']
  const energyStocks = ['RELIANCE', 'ONGC', 'NTPC', 'POWERGRID', 'ADANIGREEN', 'TATAPOWERS', 'BPCL', 'IOC']
  const autoStocks = ['TATAMOTORS', 'M&M', 'MARUTI', 'BAJAJ-AUTO', 'EICHERMOT', 'HEROMOTOCO', 'TVSMOTOR']
  const fmcgStocks = ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'MARICO', 'GODREJCP']
  const itServicesStocks = ['TCS', 'INFY', 'WIPRO', 'TECHM', 'HCLTECH']
  
  const upperSymbol = symbol.toUpperCase().replace('.NS', '').replace('.BSE', '')
  
  if (bankStocks.includes(upperSymbol)) return 'Banking'
  if (techStocks.includes(upperSymbol)) return 'Technology'
  if (pharmaStocks.includes(upperSymbol)) return 'Pharmaceuticals'
  if (energyStocks.includes(upperSymbol)) return 'Energy'
  if (autoStocks.includes(upperSymbol)) return 'Automobile'
  if (fmcgStocks.includes(upperSymbol)) return 'FMCG'
  if (itServicesStocks.includes(upperSymbol)) return 'IT Services'
  
  return 'Other'
}

// GET - Get grouped watchlist by category
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        watchlists: {
          where: { isDefault: true },
          include: {
            items: true
          }
        }
      }
    })

    if (!user || !user.watchlists[0]) {
      return NextResponse.json({ 
        grouped: {},
        categories: []
      })
    }

    const items = user.watchlists[0].items

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const category = item.category || getCategoryFromSymbol(item.symbol)
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, typeof items>)

    const categories = Object.keys(grouped).sort()

    return NextResponse.json({
      grouped,
      categories,
      totalStocks: items.length
    })
  } catch (error) {
    console.error('Error fetching grouped watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch grouped watchlist' },
      { status: 500 }
    )
  }
}

// POST - Auto-categorize all watchlist items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        watchlists: {
          where: { isDefault: true },
          include: {
            items: true
          }
        }
      }
    })

    if (!user || !user.watchlists[0]) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const items = user.watchlists[0].items
    let updated = 0

    // Update category for each item
    for (const item of items) {
      const category = getCategoryFromSymbol(item.symbol)
      await prisma.watchlistItem.update({
        where: { id: item.id },
        data: { category }
      })
      updated++
    }

    return NextResponse.json({
      success: true,
      message: `Categorized ${updated} stocks`,
      updated
    })
  } catch (error) {
    console.error('Error categorizing watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to categorize watchlist' },
      { status: 500 }
    )
  }
}
