import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint will be called daily at 4 PM IST (10:30 AM UTC) by Vercel Cron
export async function GET(request: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key-here'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log(`Starting daily snapshot at ${new Date().toISOString()}`)

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    let totalSnapshots = 0
    let totalErrors = 0
    const allSymbols = new Set<string>()

    // Collect all unique symbols from all users' stock snapshots
    for (const user of users) {
      const { data: userStocks } = await supabaseAdmin
        .from('stock_snapshots')
        .select('symbol')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (userStocks) {
        userStocks.forEach(stock => allSymbols.add(stock.symbol))
      }
    }

    const symbols = Array.from(allSymbols)
    console.log(`Found ${symbols.length} unique stocks to snapshot`)

    if (symbols.length === 0) {
      console.log('No stocks to snapshot')
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        total: 0,
        successful: 0,
        skipped: 0,
        failed: 0,
        message: 'No stocks found to snapshot'
      })
    }

    // Fetch and store snapshots for all symbols
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        try {
          const yahooSymbol = `${symbol}.NS`
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`
          
          const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
          })

          if (!response.ok) {
            console.error(`Failed to fetch ${symbol}`)
            return { symbol, success: false }
          }

          const data = await response.json()
          const result = data.chart?.result?.[0]
          if (!result) {
            console.error(`No data for ${symbol}`)
            return { symbol, success: false }
          }

          const meta = result.meta
          const quote = result.indicators?.quote?.[0]
          if (!quote) {
            console.error(`No quote for ${symbol}`)
            return { symbol, success: false }
          }

          const latestIndex = quote.close.length - 1
          const currentPrice = quote.close[latestIndex]
          const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice
          const change = currentPrice - previousClose
          const changePercent = ((change / previousClose) * 100)

          // Get today's date for snapshot
          const today = new Date()
          const snapshotDate = today.toISOString().split('T')[0]
          const snapshotTime = today.toTimeString().split(' ')[0]

          // Store snapshot for each user who has this stock
          const usersWithStock = users.filter(async (user) => {
            const { data } = await supabaseAdmin
              .from('stock_snapshots')
              .select('symbol')
              .eq('user_id', user.id)
              .eq('symbol', symbol)
              .single()
            return !!data
          })

          let savedCount = 0
          let skippedCount = 0

          for (const user of users) {
            // Check if snapshot already exists for this user and symbol today
            const { data: existing } = await supabaseAdmin
              .from('stock_snapshots')
              .select('id')
              .eq('user_id', user.id)
              .eq('symbol', symbol)
              .eq('snapshot_date', snapshotDate)
              .single()

            if (existing) {
              skippedCount++
              continue
            }

            // Create snapshot for this user
            const { error: insertError } = await supabaseAdmin
              .from('stock_snapshots')
              .insert({
                user_id: user.id,
                symbol,
                price: currentPrice,
                change,
                change_percent: changePercent,
                volume: quote.volume[latestIndex],
                market_cap: meta.marketCap || null,
                snapshot_date: snapshotDate,
                snapshot_time: snapshotTime
              })

            if (!insertError) {
              savedCount++
            }
          }

          console.log(`Snapshot for ${symbol}: ${savedCount} saved, ${skippedCount} skipped`)
          return { 
            symbol, 
            success: true, 
            saved: savedCount,
            skipped: skippedCount 
          }
        } catch (error) {
          console.error(`Error for ${symbol}:`, error)
          return { symbol, success: false, error: String(error) }
        }
      })
    )

    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length
    
    const failed = results.length - successful

    const summary = {
      timestamp: new Date().toISOString(),
      total: symbols.length,
      successful,
      failed,
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      )
    }

    console.log('Daily snapshot completed:', summary)

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error in daily snapshot cron:', error)
    return NextResponse.json(
      { error: 'Failed to run daily snapshot', details: String(error) },
      { status: 500 }
    )
  }
}
