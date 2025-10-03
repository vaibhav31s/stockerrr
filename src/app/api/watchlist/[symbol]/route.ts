import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

// DELETE - Remove a specific stock from watchlist
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const symbol = params.symbol.toUpperCase()

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

    // Delete the specific item
    const deletedItem = await prisma.watchlistItem.deleteMany({
      where: {
        watchlistId: watchlist.id,
        symbol: symbol
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Stock not found in watchlist' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${symbol} removed from watchlist`
    })
  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from watchlist' },
      { status: 500 }
    )
  }
}

// PATCH - Update watchlist item (price targets, notes, etc.)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ symbol: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const params = await context.params
    const symbol = params.symbol.toUpperCase()
    const body = await request.json()
    const { addedPrice, targetPrice, stopLoss, notes } = body

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

    // Update the item
    const updatedItem = await prisma.watchlistItem.updateMany({
      where: {
        watchlistId: watchlist.id,
        symbol: symbol
      },
      data: {
        addedPrice,
        targetPrice,
        stopLoss,
        notes,
      }
    })

    if (updatedItem.count === 0) {
      return NextResponse.json(
        { error: 'Stock not found in watchlist' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${symbol} updated in watchlist`
    })
  } catch (error) {
    console.error('Error updating watchlist item:', error)
    return NextResponse.json(
      { error: 'Failed to update watchlist item' },
      { status: 500 }
    )
  }
}
