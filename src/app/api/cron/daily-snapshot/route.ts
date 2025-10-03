import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    let totalSnapshots = 0
    let totalErrors = 0
    const allSymbols = new Set<string>()

    // Collect all unique symbols from all users' historical data
    for (const user of users.users) {
      const { data: userStocks } = await supabaseAdmin
        .from('stock_data')
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

          // Find or create stock
          let stock = await prisma.stock.findUnique({
            where: { symbol }
          })

          if (!stock) {
            stock = await prisma.stock.create({
              data: {
                symbol,
                name: meta.longName || symbol,
                exchange: meta.exchangeName || 'NSE',
              }
            })
          }

          // Check if snapshot already exists for today
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const existingSnapshot = await prisma.stockData.findFirst({
            where: {
              stockId: stock.id,
              timeframe: '1d',
              timestamp: {
                gte: today,
                lt: tomorrow
              }
            }
          })

          if (existingSnapshot) {
            console.log(`Snapshot already exists for ${symbol}`)
            return { symbol, success: true, skipped: true }
          }

          // Create snapshot
          await prisma.stockData.create({
            data: {
              stockId: stock.id,
              symbol: symbol,
              open: quote.open[latestIndex],
              high: quote.high[latestIndex],
              low: quote.low[latestIndex],
              close: quote.close[latestIndex],
              volume: BigInt(quote.volume[latestIndex]),
              adjustedClose: quote.close[latestIndex],
              timestamp: new Date(),
              timeframe: '1d',
            }
          })

          console.log(`Snapshot created for ${symbol}`)
          return { symbol, success: true }
        } catch (error) {
          console.error(`Error for ${symbol}:`, error)
          return { symbol, success: false, error: String(error) }
        }
      })
    )

    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length
    
    const skipped = results.filter(r => 
      r.status === 'fulfilled' && r.value.skipped
    ).length
    
    const failed = results.length - successful - skipped

    const summary = {
      timestamp: new Date().toISOString(),
      total: symbols.length,
      successful,
      skipped,
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
  } finally {
    await prisma.$disconnect()
  }
}
