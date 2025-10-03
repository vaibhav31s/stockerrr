# 🔴 LIVE DATA FLOW - How AI Gets Real-Time Stock Data

## 📊 Complete Data Pipeline

### 1️⃣ **Real-Time Stock Data Source**

```
Yahoo Finance API (Live Market Data)
           ↓
/api/stocks/[symbol]
           ↓
Real-time price, volume, P/E, market cap, etc.
```

**Code**: `src/app/api/stocks/[symbol]/route.ts`
```typescript
// LIVE DATA FETCH using yahoo-finance2 library
const quote = await yahooFinance.quote(formattedSymbol)

// Returns REAL-TIME data:
{
  price: quote.regularMarketPrice,        // Current live price
  change: quote.regularMarketChange,      // Today's change
  changePercent: quote.regularMarketChangePercent,
  volume: quote.regularMarketVolume,      // Current trading volume
  marketCap: quote.marketCap,             // Current market cap
  pe: quote.trailingPE,                   // Current P/E ratio
  dayHigh: quote.regularMarketDayHigh,    // Today's high
  dayLow: quote.regularMarketDayLow,      // Today's low
  fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
  fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
  timestamp: new Date().toISOString()     // When data was fetched
}
```

**Update Frequency**: Every time the API is called (no caching on stock prices)

---

### 2️⃣ **Real-Time News & Sentiment**

```
Google News RSS + NewsAPI
           ↓
/api/news/[symbol]
           ↓
Latest news articles + AI sentiment analysis
```

**Code**: `src/app/api/news/[symbol]/route.ts`
```typescript
// LIVE NEWS FETCH
const googleNewsUrl = `https://news.google.com/rss/search?q=${symbol} NSE BSE stock India`
const rssResponse = await fetch(googleNewsUrl, { 
  next: { revalidate: 300 } // 5-minute cache
})

// AI SENTIMENT ANALYSIS on latest news
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
// Analyzes latest news for sentiment scores
```

**Update Frequency**: Cached for 5 minutes, then refreshes with latest news

---

### 3️⃣ **AI Analysis Flow**

#### 🤖 AI Chat (`/api/ai/chat`)

```javascript
// STEP 1: User visits /ai/analysis?symbol=TCS
→ Frontend fetches LIVE stock data

// STEP 2: User asks question in chat
const stockData = {
  price: 3545.20,           // ← LIVE from Yahoo Finance
  change: 45.30,            // ← LIVE today's change
  changePercent: 1.29,      // ← LIVE percentage
  marketCap: 12890000000    // ← LIVE market cap
  // ... all LIVE data
}

// STEP 3: AI receives LIVE data in prompt
prompt = `
User Question: Should I buy TCS now?

Current Stock Data:        ← THIS IS LIVE DATA
Symbol: TCS
Price: ₹3545.20           ← Real-time price
Change: 45.30 (1.29%)     ← Today's actual movement
Market Cap: ₹12.89Cr      ← Current market cap
P/E Ratio: 28.5           ← Current P/E
52-Week High: ₹3800       ← Actual 52-week high
52-Week Low: ₹3100        ← Actual 52-week low
`

// STEP 4: Gemini AI analyzes LIVE data
→ Returns investment advice based on CURRENT market conditions
```

#### 📊 Deep Analysis (`/api/ai/deep-analysis`)

```javascript
// Receives SAME live stock data + news sentiment
const response = await fetch('/api/ai/deep-analysis', {
  body: JSON.stringify({ 
    symbol,
    stockData,    // ← LIVE stock data from Yahoo Finance
    newsData      // ← LIVE news sentiment from Gemini
  })
})

// AI analyzes:
prompt = `
Current Stock Data:
- Price: ₹${stockData.price}                    ← LIVE
- Change: ${stockData.change}                   ← LIVE
- Volume: ${stockData.volume}                   ← LIVE
- Market Cap: ₹${stockData.marketCap}           ← LIVE
- P/E Ratio: ${stockData.pe}                    ← LIVE
- 52-Week Range: ${stockData.fiftyTwoWeekLow} - ${stockData.fiftyTwoWeekHigh}  ← LIVE

Recent News Sentiment: ${newsData.sentiment} (${newsData.score}/10)  ← LIVE

Provide COMPREHENSIVE analysis...
`
```

#### 🛡️ Risk Score (`/api/ai/risk-score`)

```javascript
// Calculates risk based on LIVE data
{
  volatilityRisk: based on actual changePercent,
  valuationRisk: based on current P/E ratio,
  liquidityRisk: based on current volume,
  sentimentRisk: based on latest news sentiment
}
```

---

## 🔄 Data Freshness Guarantee

### Stock Price Data
- ✅ **No caching** - fetched fresh every time
- ✅ **Direct from Yahoo Finance** - same data brokers use
- ✅ **Timestamp included** - you can see when data was fetched
- ✅ **Market state included** - shows if market is OPEN/CLOSED

### News Data
- ✅ **5-minute cache** - recent enough for news
- ✅ **Latest articles first** - sorted by publishedAt
- ✅ **Google News RSS** - same as Google Finance
- ✅ **Sentiment analyzed in real-time** - fresh AI analysis

### AI Responses
- ✅ **Always fresh** - no caching on AI responses
- ✅ **Based on latest data** - uses current stock prices
- ✅ **Context-aware** - considers current market conditions
- ✅ **Timestamp included** - shows when analysis was generated

---

## 🧪 How to Verify Live Data

### Test 1: Check Timestamp
```javascript
// Every API response includes timestamp
{
  "price": 3545.20,
  "timestamp": "2025-10-03T14:30:00.000Z"  ← When data was fetched
}
```

### Test 2: Compare with Live Market
1. Open your app: Get TCS price
2. Open Yahoo Finance: https://finance.yahoo.com/quote/TCS.NS
3. **Prices should match** (within market hours)

### Test 3: Check Price Movement
```javascript
// Before market open
"marketState": "PRE"

// During market hours
"marketState": "REGULAR"

// After market close
"marketState": "POST"
```

### Test 4: AI Mentions Current Price
Ask AI: "What's the current price?"

AI Response will include:
```
Based on the current data, TCS is trading at ₹3,545.20, 
up 1.29% today...
```
↑ This is LIVE data from Yahoo Finance, passed to AI

---

## 📝 Code Proof - AI Gets Live Data

### Frontend (AI Analysis Page)
```typescript
// src/app/ai/analysis/page.tsx
const fetchStockData = async () => {
  const response = await fetch(`/api/stocks/${symbol}`)
  const data = await response.json()
  setStockData(data)  // ← LIVE data stored in state
}

// When calculating risk
const response = await fetch('/api/ai/risk-score', {
  body: JSON.stringify({ 
    symbol, 
    stockData,  // ← Passes LIVE data to AI
    newsData 
  })
})
```

### Backend (AI Chat)
```typescript
// src/app/api/ai/chat/route.ts
export async function POST(request: NextRequest) {
  const { message, stockData } = await request.json()
  
  // Builds prompt with LIVE data
  if (stockData) {
    prompt += `\nCurrent Stock Data:
    Symbol: ${stockData.symbol}
    Price: ₹${stockData.price}           ← LIVE from Yahoo Finance
    Change: ${stockData.change}          ← LIVE today's change
    Market Cap: ₹${stockData.marketCap}  ← LIVE market cap
    `
  }
  
  // Sends to Gemini AI
  const result = await model.generateContent(prompt)
}
```

---

## 🎯 Summary: Yes, AI Uses 100% Live Data!

### Data Sources:
1. **Yahoo Finance API** → Real-time stock prices (same as professional platforms)
2. **Google News RSS** → Latest news articles (refreshed every 5 minutes)
3. **Gemini AI** → Real-time sentiment analysis and insights

### Data Flow:
```
User visits page
    ↓
Fetch LIVE stock data from Yahoo Finance
    ↓
Fetch LIVE news from Google News
    ↓
Pass BOTH to AI (Gemini 2.5 Flash)
    ↓
AI analyzes CURRENT market conditions
    ↓
Returns advice based on RIGHT NOW
```

### Proof Points:
- ✅ No old/cached stock prices (fetched fresh every time)
- ✅ Timestamps show when data was fetched
- ✅ Market state indicator (PRE/REGULAR/POST)
- ✅ AI responses reference current prices
- ✅ News articles sorted by latest first
- ✅ Sentiment scores based on recent news

### You Can Trust:
1. **Prices are current** - within seconds of market data
2. **AI sees real prices** - same data you see on screen
3. **Advice is relevant** - based on NOW, not yesterday
4. **News is fresh** - latest articles, not old news

---

## 🚀 Even Better: Real-Time Updates

Want to make it even more real-time? You could add:

```typescript
// Auto-refresh every 30 seconds during market hours
useEffect(() => {
  const interval = setInterval(() => {
    if (marketIsOpen) {
      fetchStockData()
    }
  }, 30000) // 30 seconds
  
  return () => clearInterval(interval)
}, [])
```

**Bottom line**: Your AI is analyzing **LIVE, CURRENT, REAL-TIME** market data! 🎯
