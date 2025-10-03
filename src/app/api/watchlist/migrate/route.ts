import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

// POST - Migrate localStorage watchlist to database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbols } = body

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: 'Symbols array is required' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        watchlists: {
          where: { isDefault: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create default watchlist
    let watchlist = user.watchlists[0]
    
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId: user.id,
          name: 'My Watchlist',
          isDefault: true,
        }
      })
    }

    // Add each symbol to the watchlist (skip duplicates)
    const results = []
    for (const symbol of symbols) {
      try {
        const upperSymbol = symbol.toUpperCase()
        
        // Check if already exists
        const existing = await prisma.watchlistItem.findUnique({
          where: {
            watchlistId_symbol: {
              watchlistId: watchlist.id,
              symbol: upperSymbol
            }
          }
        })

        if (existing) {
          results.push({ symbol: upperSymbol, status: 'already_exists' })
          continue
        }

        // Create new item
        await prisma.watchlistItem.create({
          data: {
            watchlistId: watchlist.id,
            symbol: upperSymbol,
          }
        })

        results.push({ symbol: upperSymbol, status: 'added' })
      } catch (error) {
        console.error(`Error migrating ${symbol}:`, error)
        results.push({ symbol, status: 'error' })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results
    })
  } catch (error) {
    console.error('Error migrating watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to migrate watchlist' },
      { status: 500 }
    )
  }
}
