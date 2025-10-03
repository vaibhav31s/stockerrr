import { NextRequest, NextResponse } from 'next/server'

// Popular Indian stocks database (NSE/BSE)
const INDIAN_STOCKS = [
  // Banking & Finance - NSE
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE' },
  { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
  { symbol: 'AXISBANK', name: 'Axis Bank Limited', exchange: 'NSE' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', exchange: 'NSE' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Limited', exchange: 'NSE' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Limited', exchange: 'NSE' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Limited', exchange: 'NSE' },
  { symbol: 'PNB', name: 'Punjab National Bank', exchange: 'NSE' },
  { symbol: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE' },
  { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank Limited', exchange: 'NSE' },
  { symbol: 'FEDERALBNK', name: 'Federal Bank Limited', exchange: 'NSE' },
  
  // Banking & Finance - BSE
  { symbol: '500180', name: 'HDFC Bank Limited', exchange: 'BSE' },
  { symbol: '532174', name: 'ICICI Bank Limited', exchange: 'BSE' },
  { symbol: '500112', name: 'State Bank of India', exchange: 'BSE' },
  { symbol: '532215', name: 'Axis Bank Limited', exchange: 'BSE' },
  { symbol: '500247', name: 'Kotak Mahindra Bank Limited', exchange: 'BSE' },
  { symbol: '532187', name: 'IndusInd Bank Limited', exchange: 'BSE' },
  { symbol: '500034', name: 'Bank of Baroda', exchange: 'BSE' },
  
  // IT & Technology - NSE
  { symbol: 'TCS', name: 'Tata Consultancy Services Limited', exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Limited', exchange: 'NSE' },
  { symbol: 'TECHM', name: 'Tech Mahindra Limited', exchange: 'NSE' },
  { symbol: 'LTI', name: 'Larsen & Toubro Infotech Limited', exchange: 'NSE' },
  { symbol: 'MPHASIS', name: 'Mphasis Limited', exchange: 'NSE' },
  { symbol: 'COFORGE', name: 'Coforge Limited', exchange: 'NSE' },
  
  // IT & Technology - BSE
  { symbol: '532540', name: 'Tata Consultancy Services Limited', exchange: 'BSE' },
  { symbol: '500209', name: 'Infosys Limited', exchange: 'BSE' },
  { symbol: '507685', name: 'Wipro Limited', exchange: 'BSE' },
  { symbol: '532281', name: 'HCL Technologies Limited', exchange: 'BSE' },
  { symbol: '532755', name: 'Tech Mahindra Limited', exchange: 'BSE' },
  
  // Conglomerate & Industrial - NSE
  { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE' },
  { symbol: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports and Special Economic Zone Limited', exchange: 'NSE' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Limited', exchange: 'NSE' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Limited', exchange: 'NSE' },
  { symbol: 'TATAPOWER', name: 'Tata Power Company Limited', exchange: 'NSE' },
  { symbol: 'TATASTEEL', name: 'Tata Steel Limited', exchange: 'NSE' },
  
  // Conglomerate & Industrial - BSE
  { symbol: '500325', name: 'Reliance Industries Limited', exchange: 'BSE' },
  { symbol: '500510', name: 'Larsen & Toubro Limited', exchange: 'BSE' },
  { symbol: '532921', name: 'Adani Ports and Special Economic Zone Limited', exchange: 'BSE' },
  { symbol: '512599', name: 'Adani Enterprises Limited', exchange: 'BSE' },
  { symbol: '500570', name: 'Tata Motors Limited', exchange: 'BSE' },
  { symbol: '500400', name: 'Tata Steel Limited', exchange: 'BSE' },
  
  // FMCG & Consumer - NSE
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE' },
  { symbol: 'NESTLEIND', name: 'Nestle India Limited', exchange: 'NSE' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Limited', exchange: 'NSE' },
  { symbol: 'DABUR', name: 'Dabur India Limited', exchange: 'NSE' },
  { symbol: 'MARICO', name: 'Marico Limited', exchange: 'NSE' },
  { symbol: 'GODREJCP', name: 'Godrej Consumer Products Limited', exchange: 'NSE' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Limited', exchange: 'NSE' },
  
  // FMCG & Consumer - BSE
  { symbol: '500696', name: 'Hindustan Unilever Limited', exchange: 'BSE' },
  { symbol: '500875', name: 'ITC Limited', exchange: 'BSE' },
  { symbol: '500790', name: 'Nestle India Limited', exchange: 'BSE' },
  { symbol: '500825', name: 'Britannia Industries Limited', exchange: 'BSE' },
  
  // Pharmaceutical - NSE
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Limited', exchange: 'NSE' },
  { symbol: 'DRREDDY', name: 'Dr. Reddys Laboratories Limited', exchange: 'NSE' },
  { symbol: 'CIPLA', name: 'Cipla Limited', exchange: 'NSE' },
  { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories Limited', exchange: 'NSE' },
  { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma Limited', exchange: 'NSE' },
  { symbol: 'LUPIN', name: 'Lupin Limited', exchange: 'NSE' },
  { symbol: 'BIOCON', name: 'Biocon Limited', exchange: 'NSE' },
  
  // Pharmaceutical - BSE
  { symbol: '524715', name: 'Sun Pharmaceutical Industries Limited', exchange: 'BSE' },
  { symbol: '500124', name: 'Dr. Reddys Laboratories Limited', exchange: 'BSE' },
  { symbol: '500087', name: 'Cipla Limited', exchange: 'BSE' },
  
  // Automobile - NSE
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', exchange: 'NSE' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Limited', exchange: 'NSE' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Limited', exchange: 'NSE' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Limited', exchange: 'NSE' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Limited', exchange: 'NSE' },
  { symbol: 'TVSMOTOR', name: 'TVS Motor Company Limited', exchange: 'NSE' },
  
  // Automobile - BSE
  { symbol: '532500', name: 'Maruti Suzuki India Limited', exchange: 'BSE' },
  { symbol: '500520', name: 'Mahindra & Mahindra Limited', exchange: 'BSE' },
  { symbol: '532977', name: 'Bajaj Auto Limited', exchange: 'BSE' },
  { symbol: '500182', name: 'Hero MotoCorp Limited', exchange: 'BSE' },
  
  // Energy & Oil - NSE
  { symbol: 'ONGC', name: 'Oil and Natural Gas Corporation Limited', exchange: 'NSE' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corporation Limited', exchange: 'NSE' },
  { symbol: 'IOC', name: 'Indian Oil Corporation Limited', exchange: 'NSE' },
  { symbol: 'NTPC', name: 'NTPC Limited', exchange: 'NSE' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Limited', exchange: 'NSE' },
  { symbol: 'COALINDIA', name: 'Coal India Limited', exchange: 'NSE' },
  
  // Energy & Oil - BSE
  { symbol: '500312', name: 'Oil and Natural Gas Corporation Limited', exchange: 'BSE' },
  { symbol: '500547', name: 'Bharat Petroleum Corporation Limited', exchange: 'BSE' },
  { symbol: '530965', name: 'Indian Oil Corporation Limited', exchange: 'BSE' },
  
  // Telecom & Media - NSE
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE' },
  { symbol: 'ZEEL', name: 'Zee Entertainment Enterprises Limited', exchange: 'NSE' },
  
  // Telecom & Media - BSE
  { symbol: '532454', name: 'Bharti Airtel Limited', exchange: 'BSE' },
  
  // Real Estate & Construction - NSE
  { symbol: 'DLF', name: 'DLF Limited', exchange: 'NSE' },
  { symbol: 'GODREJPROP', name: 'Godrej Properties Limited', exchange: 'NSE' },
  { symbol: 'OBEROIRLTY', name: 'Oberoi Realty Limited', exchange: 'NSE' },
  
  // Metals & Mining - NSE
  { symbol: 'HINDALCO', name: 'Hindalco Industries Limited', exchange: 'NSE' },
  { symbol: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Limited', exchange: 'NSE' },
  { symbol: 'SAIL', name: 'Steel Authority of India Limited', exchange: 'NSE' },
  
  // Metals & Mining - BSE
  { symbol: '500440', name: 'Hindalco Industries Limited', exchange: 'BSE' },
  { symbol: '500295', name: 'Vedanta Limited', exchange: 'BSE' },
  
  // Cement - NSE
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Limited', exchange: 'NSE' },
  { symbol: 'GRASIM', name: 'Grasim Industries Limited', exchange: 'NSE' },
  { symbol: 'SHREECEM', name: 'Shree Cement Limited', exchange: 'NSE' },
  { symbol: 'ACC', name: 'ACC Limited', exchange: 'NSE' },
  
  // Cement - BSE
  { symbol: '532538', name: 'UltraTech Cement Limited', exchange: 'BSE' },
  { symbol: '500300', name: 'Grasim Industries Limited', exchange: 'BSE' },
  
  // E-commerce & New Age Tech - NSE
  { symbol: 'ZOMATO', name: 'Zomato Limited', exchange: 'NSE' },
  { symbol: 'NYKAA', name: 'FSN E-Commerce Ventures Limited (Nykaa)', exchange: 'NSE' },
  { symbol: 'PAYTM', name: 'One 97 Communications Limited (Paytm)', exchange: 'NSE' },
  
  // Others - NSE
  { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', exchange: 'NSE' },
  { symbol: 'TITAN', name: 'Titan Company Limited', exchange: 'NSE' },
  { symbol: 'PIDILITIND', name: 'Pidilite Industries Limited', exchange: 'NSE' },
  { symbol: 'HAVELLS', name: 'Havells India Limited', exchange: 'NSE' },
  
  // Others - BSE
  { symbol: '500820', name: 'Asian Paints Limited', exchange: 'BSE' },
  { symbol: '500114', name: 'Titan Company Limited', exchange: 'BSE' },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase() || ''
    
    if (!query) {
      // Return top 10 popular stocks if no query
      return NextResponse.json({
        results: INDIAN_STOCKS.slice(0, 10),
        total: INDIAN_STOCKS.length
      })
    }
    
    // Search by symbol or name
    const results = INDIAN_STOCKS.filter(stock => 
      stock.symbol.toLowerCase().includes(query) || 
      stock.name.toLowerCase().includes(query)
    ).slice(0, 15) // Limit to 15 results
    
    return NextResponse.json({
      results,
      query,
      total: results.length
    })
    
  } catch (error: any) {
    console.error('Error searching stocks:', error)
    return NextResponse.json(
      { error: 'Failed to search stocks', details: error.message },
      { status: 500 }
    )
  }
}
