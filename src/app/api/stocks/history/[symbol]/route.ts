import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET /api/stocks/history/[symbol] - Get historical data for a stock
export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)

    // Calculate the start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch stock snapshots from database
    const { data: snapshots, error } = await supabase
      .from('stock_snapshots')
      .select('*')
      .eq('symbol', symbol)
      .gte('snapshot_date', startDateStr)
      .order('snapshot_date', { ascending: false })

    if (error) {
      console.error('Error fetching from Supabase:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data from database' },
        { status: 500 }
      )
    }

    if (!snapshots || snapshots.length === 0) {
      return NextResponse.json(
        { error: 'No historical data found for this stock' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const prices = snapshots.map(d => d.price)
    const currentPrice = prices[0]
    const oldestPrice = prices[prices.length - 1]
    
    const change = currentPrice - oldestPrice
    const changePercent = ((change / oldestPrice) * 100)

    return NextResponse.json({
      symbol,
      name: symbol, // We don't store name in snapshots table
      currentPrice,
      oldestPrice,
      change,
      changePercent,
      days,
      dataPoints: snapshots.length,
      history: snapshots.map(d => ({
        date: d.snapshot_date,
        time: d.snapshot_time,
        price: d.price,
        change: d.change,
        changePercent: d.change_percent,
        volume: d.volume,
        marketCap: d.market_cap,
      }))
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}
