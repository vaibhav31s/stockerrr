import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const daysAgo = parseInt(searchParams.get('daysAgo') || '1')
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
    }

    // Calculate the target date
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - daysAgo)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    // Fetch the historical snapshot
    const { data, error } = await supabase
      .from('stock_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('symbol', symbol.toUpperCase())
      .eq('snapshot_date', targetDateStr)
      .order('snapshot_time', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return NextResponse.json({
          found: false,
          symbol: symbol.toUpperCase(),
          date: targetDateStr,
          daysAgo
        })
      }
      
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 })
    }

    return NextResponse.json({
      found: true,
      symbol: data.symbol,
      price: data.price,
      change: data.change,
      changePercent: data.change_percent,
      volume: data.volume,
      marketCap: data.market_cap,
      date: data.snapshot_date,
      time: data.snapshot_time,
      daysAgo
    })

  } catch (error) {
    console.error('Historical data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
