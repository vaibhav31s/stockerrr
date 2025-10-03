import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Fetch stock data from database
    const stock = await prisma.stock.findUnique({
      where: { symbol },
      include: {
        stockData: {
          where: {
            timeframe: '1d',
            timestamp: {
              gte: startDate
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!stock) {
      return NextResponse.json(
        { error: 'Stock not found in database' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const prices = stock.stockData.map(d => d.close)
    const currentPrice = prices[0]
    const oldestPrice = prices[prices.length - 1]
    
    const change = currentPrice - oldestPrice
    const changePercent = ((change / oldestPrice) * 100)

    return NextResponse.json({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice,
      oldestPrice,
      change,
      changePercent,
      days,
      dataPoints: stock.stockData.length,
      history: stock.stockData.map(d => ({
        date: d.timestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume.toString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
