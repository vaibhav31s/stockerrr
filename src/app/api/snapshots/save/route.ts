import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { symbols } = body

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: 'Symbols array is required' }, { status: 400 })
    }

    const snapshots = []
    const errors = []

    // Fetch current data for each symbol and save snapshot
    for (const symbol of symbols) {
      try {
        const stockResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/stocks/${symbol}`)
        
        if (!stockResponse.ok) {
          errors.push({ symbol, error: 'Failed to fetch stock data' })
          continue
        }

        const stockData = await stockResponse.json()

        // Save snapshot to database
        const { data, error } = await supabase
          .from('stock_data')
          .insert({
            user_id: session.user.id,
            symbol: symbol,
            name: stockData.name,
            price: stockData.price,
            change: stockData.change,
            change_percent: stockData.changePercent,
            volume: stockData.volume,
            market_cap: stockData.marketCap,
            pe_ratio: stockData.pe,
            snapshot_date: new Date().toISOString(),
          })

        if (error) {
          errors.push({ symbol, error: error.message })
        } else {
          snapshots.push({ symbol, saved: true })
        }
      } catch (err) {
        errors.push({ symbol, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      saved: snapshots.length,
      snapshots,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error saving snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to save snapshots' },
      { status: 500 }
    )
  }
}
