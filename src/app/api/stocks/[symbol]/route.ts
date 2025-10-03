import { NextRequest, NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

// Helper function to format Indian stock symbols for Yahoo Finance
function formatIndianSymbol(symbol: string): string {
  const upperSymbol = symbol.toUpperCase()
  
  // If already formatted with exchange suffix, return as is
  if (upperSymbol.includes('.NS') || upperSymbol.includes('.BO')) {
    return upperSymbol
  }
  
  // Map common Indian stock symbols to NSE format
  const nseStocks = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
    'BHARTIARTL', 'SBIN', 'BAJFINANCE', 'ASIANPAINT', 'ITC', 'AXISBANK', 'LT',
    'DMART', 'MARUTI', 'SUNPHARMA', 'TITAN', 'ULTRACEMCO', 'NESTLEIND', 'WIPRO',
    'NTPC', 'POWERGRID', 'TATAMOTORS', 'TECHM', 'ONGC', 'TATASTEEL', 'COALINDIA',
    'BAJAJFINSV', 'HCLTECH', 'ADANIPORTS', 'DRREDDY', 'GRASIM', 'JSWSTEEL',
    'INDUSINDBK', 'BRITANNIA', 'APOLLOHOSP', 'CIPLA', 'BPCL', 'DIVISLAB'
  ]
  
  // Add .NS suffix for NSE stocks, .BO for others
  if (nseStocks.includes(upperSymbol)) {
    return `${upperSymbol}.NS`
  }
  
  // Default to NSE for Indian stocks
  return `${upperSymbol}.NS`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params
    
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    // Format the symbol for Indian markets
    const formattedSymbol = formatIndianSymbol(symbol)
    
    console.log(`Fetching data for: ${formattedSymbol}`)

    // Get current quote data
    const quote = await yahooFinance.quote(formattedSymbol)
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      )
    }

    // Format the response with Indian market specifics
    const stockData = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
      eps: (quote as any).trailingEps || null,
      dividend: (quote as any).dividendYield || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      currency: quote.currency || 'INR',
      exchange: quote.fullExchangeName?.includes('NSE') ? 'NSE' : 
                quote.fullExchangeName?.includes('BSE') ? 'BSE' : 
                quote.fullExchangeName || 'NSE',
      marketState: quote.marketState,
      sector: (quote as any).sector || null,
      industry: (quote as any).industry || null,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(stockData)
  } catch (error: any) {
    console.error('Error fetching Indian stock data:', error)
    
    // Try alternate exchange if NSE fails
    if (error.message?.includes('Not found') && symbol.includes('.NS')) {
      try {
        const bseSymbol = symbol.replace('.NS', '.BO')
        const quote = await yahooFinance.quote(bseSymbol)
        
        const stockData = {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          previousClose: quote.regularMarketPreviousClose,
          open: quote.regularMarketOpen,
          dayHigh: quote.regularMarketDayHigh,
          dayLow: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          pe: quote.trailingPE,
          eps: (quote as any).trailingEps || null,
          dividend: (quote as any).dividendYield || null,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          currency: 'INR',
          exchange: 'BSE',
          marketState: quote.marketState,
          timestamp: new Date().toISOString(),
        }
        
        return NextResponse.json(stockData)
      } catch (bseError) {
        // Both NSE and BSE failed
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Indian stock data', details: error.message },
      { status: 500 }
    )
  }
}