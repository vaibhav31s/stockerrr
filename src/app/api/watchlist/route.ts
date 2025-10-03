import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

// GET - Fetch user's watchlist
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        watchlists: {
          include: {
            items: {
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create default watchlist
    let watchlist = user.watchlists.find(w => w.isDefault)
    
    if (!watchlist) {
      watchlist = await prisma.watchlist.create({
        data: {
          userId: user.id,
          name: 'My Watchlist',
          isDefault: true,
        },
        include: {
          items: true
        }
      })
    }

    return NextResponse.json({
      watchlist: {
        id: watchlist.id,
        name: watchlist.name,
        items: watchlist.items.map(item => ({
          id: item.id,
          symbol: item.symbol,
          addedPrice: item.addedPrice,
          targetPrice: item.targetPrice,
          stopLoss: item.stopLoss,
          notes: item.notes,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbol, addedPrice, targetPrice, stopLoss, notes, category } = body

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
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

    // Check if stock already exists in watchlist
    const existingItem = await prisma.watchlistItem.findUnique({
      where: {
        watchlistId_symbol: {
          watchlistId: watchlist.id,
          symbol: symbol.toUpperCase()
        }
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Stock already in watchlist' },
        { status: 409 }
      )
    }

    // Add stock to watchlist
    const item = await prisma.watchlistItem.create({
      data: {
        watchlistId: watchlist.id,
        symbol: symbol.toUpperCase(),
        addedPrice,
        targetPrice,
        stopLoss,
        notes,
        category,
      }
    })

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        symbol: item.symbol,
        addedPrice: item.addedPrice,
        targetPrice: item.targetPrice,
        stopLoss: item.stopLoss,
        notes: item.notes,
        createdAt: item.createdAt,
      }
    })
  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Remove all items from watchlist (clear)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!user || !user.watchlists[0]) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    // Delete all items from the watchlist
    await prisma.watchlistItem.deleteMany({
      where: {
        watchlistId: user.watchlists[0].id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Watchlist cleared'
    })
  } catch (error) {
    console.error('Error clearing watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to clear watchlist' },
      { status: 500 }
    )
  }
}
