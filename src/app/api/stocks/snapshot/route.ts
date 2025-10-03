import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface StockSnapshot {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  timestamp: string
}

async function fetchStockData(symbol: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/stocks/${symbol}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { symbols } = await request.json()
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: 'Symbols array required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const snapshots: StockSnapshot[] = []
    const errors: string[] = []

    // Fetch current data for all symbols
    for (const symbol of symbols) {
      const stockData = await fetchStockData(symbol)
      
      if (stockData) {
        snapshots.push({
          symbol: symbol.toUpperCase(),
          price: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          volume: stockData.volume,
          marketCap: stockData.marketCap,
          timestamp: new Date().toISOString()
        })
      } else {
        errors.push(symbol)
      }
    }

    // Save to Supabase
    if (snapshots.length > 0) {
      // First, delete any existing snapshots for today (to avoid duplicates)
      await supabase
        .from('stock_snapshots')
        .delete()
        .eq('user_id', user.id)
        .eq('snapshot_date', today)
        .in('symbol', symbols)

      // Insert new snapshots
      const { data, error } = await supabase
        .from('stock_snapshots')
        .insert(
          snapshots.map(snapshot => ({
            user_id: user.id,
            symbol: snapshot.symbol,
            price: snapshot.price,
            change: snapshot.change,
            change_percent: snapshot.changePercent,
            volume: snapshot.volume,
            market_cap: snapshot.marketCap,
            snapshot_date: today,
            snapshot_time: snapshot.timestamp
          }))
        )
        .select()

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({ error: 'Failed to save snapshots' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        saved: snapshots.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        snapshots: data
      })
    }

    return NextResponse.json({
      success: false,
      error: 'No valid stock data found'
    }, { status: 400 })

  } catch (error) {
    console.error('Snapshot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check if today's snapshot exists
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',') || []
    
    if (symbols.length === 0) {
      return NextResponse.json({ error: 'Symbols required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('stock_snapshots')
      .select('symbol, snapshot_date')
      .eq('user_id', user.id)
      .eq('snapshot_date', today)
      .in('symbol', symbols)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to check snapshots' }, { status: 500 })
    }

    const existingSymbols = new Set(data.map((d: any) => d.symbol))
    const missingSymbols = symbols.filter(s => !existingSymbols.has(s.toUpperCase()))

    return NextResponse.json({
      date: today,
      total: symbols.length,
      existing: data.length,
      missing: missingSymbols.length,
      missingSymbols,
      needsSync: missingSymbols.length > 0
    })

  } catch (error) {
    console.error('Check snapshot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
