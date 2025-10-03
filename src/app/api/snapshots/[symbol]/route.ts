import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const supabase = createServerComponentClient()
    
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { symbol } = params
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '365')

    // Calculate the date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch historical data
    const { data, error } = await supabase
      .from('stock_data')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('symbol', symbol)
      .gte('snapshot_date', startDate.toISOString())
      .lte('snapshot_date', endDate.toISOString())
      .order('snapshot_date', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      symbol,
      days,
      count: data.length,
      data: data.map(item => ({
        date: item.snapshot_date,
        price: item.price,
        change: item.change,
        changePercent: item.change_percent,
        volume: item.volume,
        marketCap: item.market_cap,
        pe: item.pe_ratio,
      })),
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}
