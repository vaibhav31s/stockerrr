# 📚 Stockkap - Master Documentation & Architecture Guide

> **Purpose**: This document serves as the single source of truth for understanding, modifying, and extending the Stockkap application. Reference this when making changes or adding new features.

---

## 🎯 Project Overview

**Stockkap** is an AI-powered stock analysis platform that provides real-time market data, intelligent insights, and investment recommendations for Indian stock market (NSE/BSE).

### Core Value Proposition
- **Real-time stock data** from Yahoo Finance API
- **AI-powered analysis** using Google Gemini 2.5 Flash
- **News sentiment analysis** with latest market news
- **Investment recommendations** (Buy/Hold/Sell)
- **Risk assessment** across multiple categories
- **Portfolio optimization** advice

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **State Management**: React Hooks (useState, useEffect)
- **Authentication**: NextAuth.js v4 (Email/Password with JWT)

### Backend
- **API Routes**: Next.js API Routes (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs (12 salt rounds)
- **Session Management**: JWT tokens with HTTP-only cookies

### External APIs
- **Stock Data**: Yahoo Finance API (via `yahoo-finance2` npm package)
- **News Data**: Google News RSS + NewsAPI (optional)
- **AI Engine**: Google Gemini 2.5 Flash (`@google/generative-ai`)

### Development Tools
- **Package Manager**: pnpm
- **Runtime**: Node.js
- **Development Server**: Next.js dev server (port 3001)

---

## 📁 Project Structure

```
stockkap/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── api/                      # Backend API Routes
│   │   │   ├── stocks/
│   │   │   │   └── [symbol]/
│   │   │   │       └── route.ts      # GET stock data from Yahoo Finance
│   │   │   ├── news/
│   │   │   │   └── [symbol]/
│   │   │   │       └── route.ts      # GET news + AI sentiment analysis
│   │   │   ├── insights/
│   │   │   │   └── [symbol]/
│   │   │   │       └── route.ts      # GET AI investment insights
│   │   │   └── ai/                   # AI-Powered Features
│   │   │       ├── chat/
│   │   │       │   └── route.ts      # POST AI chat assistant
│   │   │       ├── deep-analysis/
│   │   │       │   └── route.ts      # POST comprehensive analysis
│   │   │       ├── compare/
│   │   │       │   └── route.ts      # POST multi-stock comparison
│   │   │       ├── portfolio-advice/
│   │   │       │   └── route.ts      # POST portfolio optimization
│   │   │       └── risk-score/
│   │   │           └── route.ts      # POST risk assessment
│   │   ├── ai/                       # AI Feature Pages
│   │   │   ├── analysis/
│   │   │   │   └── page.tsx          # AI analysis dashboard
│   │   │   └── insights/
│   │   │       └── page.tsx          # AI insights display
│   │   ├── stocks/
│   │   │   └── [symbol]/
│   │   │       └── page.tsx          # Stock detail page
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page (dashboard)
│   ├── components/                   # React Components
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── badge.tsx
│   │   ├── ai-stock-chat.tsx         # AI chat interface
│   │   ├── deep-analysis.tsx         # Analysis display component
│   │   ├── stock-chart.tsx           # Price chart component
│   │   └── news-sentiment.tsx        # News sentiment display
│   ├── lib/
│   │   └── utils.ts                  # Utility functions
│   └── styles/
│       └── globals.css               # Global styles
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/                           # Static assets
├── .env.local                        # Environment variables (gitignored)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # TailwindCSS config
├── next.config.js                    # Next.js config
├── AI_FEATURES.md                    # AI features documentation
├── AI_MODEL_FIX.md                   # AI model migration guide
├── LIVE_DATA_VERIFICATION.md         # Live data flow documentation
└── MASTER_DOCUMENTATION.md           # This file
```

---

## 🔄 Data Flow Architecture

### 1. Stock Data Flow (Real-Time)

```
User Input (Stock Symbol)
        ↓
Frontend (React Component)
        ↓
API Call: GET /api/stocks/[symbol]
        ↓
Backend: Yahoo Finance API Integration
        ↓
yahoo-finance2.quote(symbol)
        ↓
Real-time Market Data
        ↓
Response: {
  price, change, changePercent,
  volume, marketCap, pe,
  dayHigh, dayLow,
  fiftyTwoWeekHigh, fiftyTwoWeekLow,
  timestamp, marketState
}
        ↓
Frontend: Display + Store in State
        ↓
Pass to AI Components
```

### 2. AI Analysis Flow

```
User Interaction (Chat/Analysis Request)
        ↓
Frontend: Gather Context
  - stockData (from /api/stocks)
  - newsData (from /api/news)
  - userMessage (from chat input)
        ↓
API Call: POST /api/ai/[feature]
  Body: { symbol, stockData, newsData, message }
        ↓
Backend: Construct AI Prompt
  - Embed live stock data
  - Include news sentiment
  - Add user question/context
        ↓
Google Gemini API Call
  Model: gemini-2.5-flash
  Prompt: Rich context with live data
        ↓
AI Response Generation
        ↓
Response Processing
  - Parse JSON (for structured data)
  - Extract text recommendations
  - Calculate scores/ratings
        ↓
Frontend: Display Results
  - Chat messages
  - Analysis cards
  - Charts/visualizations
```

### 3. News & Sentiment Flow

```
Symbol Input
        ↓
API Call: GET /api/news/[symbol]
        ↓
Parallel Fetch:
  1. Google News RSS
     └─ Latest articles for symbol
  2. NewsAPI (if key available)
     └─ Additional news sources
        ↓
Combine & Deduplicate Articles
        ↓
AI Sentiment Analysis
  - Pass articles to Gemini AI
  - Analyze sentiment (Positive/Negative/Neutral)
  - Generate sentiment score (0-10)
        ↓
Response: {
  articles: [...],
  sentiment: "Positive/Negative/Neutral",
  score: 7.5,
  summary: "AI-generated summary"
}
        ↓
Frontend: Display with Color Coding
  - Green (Positive)
  - Red (Negative)
  - Gray (Neutral)
```

---

## 🛠️ Key Features & Implementation

### Feature 1: Real-Time Stock Dashboard

**File**: `src/app/page.tsx`

**How It Works**:
1. User searches for stock symbol (e.g., "TCS", "RELIANCE")
2. Frontend calls `/api/stocks/[symbol]`
3. Yahoo Finance returns real-time data
4. Display price, change%, volume, market cap
5. Show interactive price chart
6. Display market state (OPEN/CLOSED)

**Critical Code**:
```typescript
// Fetch stock data
const fetchStockData = async (symbol: string) => {
  const response = await fetch(`/api/stocks/${symbol}`)
  const data = await response.json()
  setStockData(data)
}
```

---

### Feature 2: AI Chat Assistant

**Files**: 
- Backend: `src/app/api/ai/chat/route.ts`
- Component: `src/components/ai-stock-chat.tsx`
- Page: `src/app/ai/analysis/page.tsx`

**How It Works**:
1. User asks question about a stock
2. Frontend sends: `{ message, context, stockData }`
3. Backend constructs prompt with live data
4. Gemini AI generates contextual response
5. Response includes current price references
6. Chat history maintained in component state

**Critical Code**:
```typescript
// Backend prompt construction
const prompt = `
You are a stock market expert assistant.

Current Stock Data:
Symbol: ${stockData.symbol}
Price: ₹${stockData.price}
Change: ${stockData.change} (${stockData.changePercent}%)
Market Cap: ₹${stockData.marketCap}
P/E Ratio: ${stockData.pe}

User Question: ${message}

Provide helpful investment insights...
`
```

**Model Used**: `gemini-2.5-flash` (✅ Working)

---

### Feature 3: Deep Investment Analysis

**Files**:
- Backend: `src/app/api/ai/deep-analysis/route.ts`
- Component: `src/components/deep-analysis.tsx`

**How It Works**:
1. User requests deep analysis for a stock
2. Frontend sends: `{ symbol, stockData, newsData }`
3. AI analyzes:
   - Technical indicators
   - Fundamental metrics
   - Market sentiment
   - News impact
   - Risk factors
4. Returns structured JSON with recommendations
5. Display in tabbed interface

**Response Structure**:
```json
{
  "technicalAnalysis": {
    "trend": "Bullish/Bearish",
    "support": 3400,
    "resistance": 3600,
    "signals": ["RSI oversold", "MACD bullish"]
  },
  "fundamentalAnalysis": {
    "valuation": "Fairly Valued",
    "strengths": [...],
    "weaknesses": [...]
  },
  "recommendation": "BUY/HOLD/SELL",
  "confidenceScore": 8.5,
  "timeHorizon": "6-12 months"
}
```

---

### Feature 4: Risk Assessment

**File**: `src/app/api/ai/risk-score/route.ts`

**How It Works**:
1. Analyzes multiple risk dimensions:
   - **Volatility Risk**: Based on price swings
   - **Valuation Risk**: Based on P/E ratio
   - **Liquidity Risk**: Based on trading volume
   - **Market Risk**: Based on market cap
   - **Sentiment Risk**: Based on news sentiment
2. Each category scored 0-10
3. Overall risk score calculated
4. Risk level categorized (Low/Medium/High)

**Critical Logic**:
```typescript
// Example: Volatility Risk Calculation
const volatilityRisk = Math.abs(stockData.changePercent) > 5 ? 8 : 
                       Math.abs(stockData.changePercent) > 3 ? 6 : 4
```

---

### Feature 5: Multi-Stock Comparison

**File**: `src/app/api/ai/compare/route.ts`

**How It Works**:
1. User provides multiple stock symbols
2. Fetch data for all stocks in parallel
3. AI compares side-by-side:
   - Valuation metrics
   - Growth potential
   - Risk profiles
   - Market positions
4. Provides ranking and recommendations

**Input**:
```json
{
  "stocks": [
    { "symbol": "TCS", "stockData": {...} },
    { "symbol": "INFY", "stockData": {...} },
    { "symbol": "WIPRO", "stockData": {...} }
  ]
}
```

---

### Feature 6: Portfolio Optimization

**File**: `src/app/api/ai/portfolio-advice/route.ts`

**How It Works**:
1. User provides current portfolio holdings
2. AI analyzes:
   - Sector diversification
   - Risk concentration
   - Performance metrics
   - Rebalancing opportunities
3. Suggests buy/sell actions
4. Provides target allocation percentages

**Input**:
```json
{
  "portfolio": [
    { "symbol": "TCS", "shares": 100, "avgPrice": 3200 },
    { "symbol": "RELIANCE", "shares": 50, "avgPrice": 2400 }
  ],
  "riskProfile": "Moderate",
  "investmentGoal": "Long-term growth"
}
```

---

## 🔑 Environment Variables

**File**: `.env.local` (create this file - not in repo)

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/stockkap"

# Google Gemini AI
GEMINI_API_KEY="your_gemini_api_key_here"

# NewsAPI (Optional - for additional news sources)
NEWS_API_KEY="your_newsapi_key_here"

# NextAuth (for authentication)
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="generate_random_secret_here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

**How to Get Keys**:
1. **Gemini API**: https://makersuite.google.com/app/apikey
2. **NewsAPI**: https://newsapi.org/register
3. **Google OAuth**: https://console.cloud.google.com/
4. **GitHub OAuth**: https://github.com/settings/developers

---

## 🗄️ Database Schema

**File**: `prisma/schema.prisma`

### Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  watchlists    Watchlist[]
  portfolios    Portfolio[]
}

model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  symbol    String
  name      String?
  addedAt   DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, symbol])
}

model Portfolio {
  id        String   @id @default(cuid())
  userId    String
  symbol    String
  shares    Float
  avgPrice  Float
  addedAt   DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}

model StockCache {
  id          String   @id @default(cuid())
  symbol      String   @unique
  data        Json
  lastFetched DateTime @default(now())
}
```

**Setup Commands**:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🚀 Development Workflow

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd stockkap

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Start development server
npm run dev
# Server runs on http://localhost:3001
```

### Adding New Features

**1. New AI Feature**:
```bash
# Create new API route
touch src/app/api/ai/new-feature/route.ts

# Template:
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  const { symbol, stockData } = await request.json()
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  
  const prompt = `Your AI prompt here with ${stockData.price}`
  
  const result = await model.generateContent(prompt)
  const response = result.response.text()
  
  return NextResponse.json({ analysis: response })
}
```

**2. New UI Component**:
```bash
# Create component
touch src/components/new-component.tsx

# Use shadcn for UI elements
npx shadcn@latest add <component-name>
```

**3. New Database Model**:
```bash
# Edit prisma/schema.prisma
# Add new model

# Push changes
npx prisma db push
npx prisma generate
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Gemini API 404 Error
**Error**: `models/gemini-pro is not found`

**Solution**: Model deprecated. Use `gemini-2.5-flash` or `gemini-1.5-flash`
```typescript
// ❌ Old (deprecated)
const model = genAI.getGenerativeModel({ model: "gemini-pro" })

// ✅ New (working)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
```

**Reference**: See `AI_MODEL_FIX.md`

---

### Issue 2: useSearchParams Error
**Error**: `useSearchParams() should be wrapped in a suspense boundary`

**Solution**: Wrap component in Suspense
```typescript
// ❌ Without Suspense
export default function Page() {
  const searchParams = useSearchParams()
  // ...
}

// ✅ With Suspense
import { Suspense } from 'react'

function PageContent() {
  const searchParams = useSearchParams()
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  )
}
```

---

### Issue 3: Stock Symbol Not Found
**Error**: Yahoo Finance returns 404

**Solution**: Check symbol format for Indian stocks
```typescript
// ❌ Wrong
symbol = "TCS"  // Will fail

// ✅ Correct for NSE
symbol = "TCS.NS"  // NSE listing
symbol = "TCS.BO"  // BSE listing

// Our code handles this automatically:
const formattedSymbol = symbol.includes('.') 
  ? symbol 
  : `${symbol}.NS`  // Default to NSE
```

---

### Issue 4: Missing shadcn Components
**Error**: `Module not found: Can't resolve '@/components/ui/tabs'`

**Solution**: Install missing shadcn components
```bash
npx shadcn@latest add tabs
npx shadcn@latest add scroll-area
npx shadcn@latest add badge
```

---

## 📊 API Reference

### Stock Data API

**Endpoint**: `GET /api/stocks/[symbol]`

**Example**: `/api/stocks/TCS`

**Response**:
```json
{
  "symbol": "TCS.NS",
  "price": 3545.20,
  "change": 45.30,
  "changePercent": 1.29,
  "volume": 2500000,
  "marketCap": 1289000000000,
  "pe": 28.5,
  "dayHigh": 3560.00,
  "dayLow": 3520.00,
  "fiftyTwoWeekHigh": 3800.00,
  "fiftyTwoWeekLow": 3100.00,
  "marketState": "REGULAR",
  "timestamp": "2025-10-03T14:30:00.000Z"
}
```

---

### News & Sentiment API

**Endpoint**: `GET /api/news/[symbol]`

**Example**: `/api/news/ICICIBANK`

**Response**:
```json
{
  "articles": [
    {
      "title": "ICICI Bank Q2 Results Beat Expectations",
      "description": "...",
      "url": "https://...",
      "source": "Economic Times",
      "publishedAt": "2025-10-03T10:30:00Z"
    }
  ],
  "sentiment": "Positive",
  "score": 7.5,
  "summary": "Recent news shows strong quarterly results..."
}
```

---

### AI Chat API

**Endpoint**: `POST /api/ai/chat`

**Request Body**:
```json
{
  "message": "Should I buy TCS at current price?",
  "context": "Previous conversation context...",
  "stockData": {
    "symbol": "TCS",
    "price": 3545.20,
    "change": 45.30,
    "changePercent": 1.29
  }
}
```

**Response**:
```json
{
  "response": "Based on current price of ₹3,545.20 (up 1.29%), TCS shows positive momentum...",
  "timestamp": "2025-10-03T14:35:00.000Z"
}
```

---

### Deep Analysis API

**Endpoint**: `POST /api/ai/deep-analysis`

**Request Body**:
```json
{
  "symbol": "TCS",
  "stockData": { /* live stock data */ },
  "newsData": { /* news sentiment data */ }
}
```

**Response**: See Feature 3 section above

---

### Risk Score API

**Endpoint**: `POST /api/ai/risk-score`

**Request Body**:
```json
{
  "symbol": "TCS",
  "stockData": { /* live stock data */ },
  "newsData": { /* news sentiment */ }
}
```

**Response**:
```json
{
  "overallRisk": 6.5,
  "riskLevel": "Medium",
  "breakdown": {
    "volatilityRisk": 4,
    "valuationRisk": 7,
    "liquidityRisk": 3,
    "marketRisk": 5,
    "sentimentRisk": 6
  },
  "analysis": "The stock shows moderate risk profile..."
}
```

---

## 🎨 UI Component Library

### shadcn/ui Components Used

```bash
# Installed components
button
card
input
label
scroll-area
tabs
badge
alert
skeleton
dropdown-menu
```

### Custom Components

1. **AIStockChat** (`src/components/ai-stock-chat.tsx`)
   - Interactive chat interface
   - Sends stock context to AI
   - Message history
   - Auto-scroll

2. **DeepAnalysis** (`src/components/deep-analysis.tsx`)
   - Tabbed analysis display
   - Technical/Fundamental/News sections
   - Recommendation cards

3. **StockChart** (`src/components/stock-chart.tsx`)
   - Price chart with Recharts
   - Interactive tooltips
   - Responsive design

4. **NewsSentiment** (`src/components/news-sentiment.tsx`)
   - News article cards
   - Sentiment badges
   - Source links

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

**Stock Data**:
- [ ] Search for valid symbol (TCS, RELIANCE, INFY)
- [ ] Verify price matches Yahoo Finance
- [ ] Check timestamp is current
- [ ] Test invalid symbol error handling

**AI Chat**:
- [ ] Ask about current price (should mention exact price)
- [ ] Ask for investment advice
- [ ] Verify response references live data
- [ ] Test conversation context

**Deep Analysis**:
- [ ] Request analysis for a stock
- [ ] Verify all tabs load (Technical, Fundamental, News)
- [ ] Check recommendation (Buy/Hold/Sell)
- [ ] Confirm confidence score displayed

**Risk Assessment**:
- [ ] Calculate risk for volatile stock
- [ ] Verify all 5 risk categories shown
- [ ] Check overall risk level matches breakdown
- [ ] Test with stable vs volatile stocks

**News Sentiment**:
- [ ] Fetch news for popular stock
- [ ] Verify sentiment badge color
- [ ] Check articles are recent (within 7 days)
- [ ] Test AI summary accuracy

---

## 🔒 Security Best Practices

### API Keys
- ✅ Never commit `.env.local` to Git
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys periodically
- ✅ Set up rate limiting on production

### Data Validation
```typescript
// Example: Validate stock symbol
const isValidSymbol = (symbol: string) => {
  return /^[A-Z0-9]+(\.[A-Z]{2})?$/.test(symbol)
}

if (!isValidSymbol(symbol)) {
  return NextResponse.json(
    { error: 'Invalid symbol format' },
    { status: 400 }
  )
}
```

### Rate Limiting
```typescript
// TODO: Implement rate limiting for AI endpoints
// Suggestion: Use upstash/ratelimit or similar
```

---

## 📈 Performance Optimization

### Current Optimizations
1. **Client-side caching**: React state prevents redundant fetches
2. **Parallel requests**: News and stock data fetched simultaneously
3. **Lazy loading**: Components load on demand
4. **Image optimization**: Next.js automatic image optimization

### Future Improvements
- [ ] Implement Redis caching for stock data (5-minute TTL)
- [ ] Add service worker for offline support
- [ ] Optimize AI prompts for faster responses
- [ ] Implement infinite scroll for news
- [ ] Add WebSocket for real-time price updates

---

## 🚢 Deployment Guide

### Vercel Deployment (Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Environment Variables for Production
```
DATABASE_URL=<neon_or_supabase_postgres_url>
GEMINI_API_KEY=<your_key>
NEWS_API_KEY=<your_key>
NEXTAUTH_URL=<your_production_url>
NEXTAUTH_SECRET=<generate_new_secret>
```

### Database Hosting Options
1. **Neon** (Recommended): https://neon.tech
2. **Supabase**: https://supabase.com
3. **Railway**: https://railway.app
4. **PlanetScale**: https://planetscale.com

---

## 🔮 Future Roadmap

### Phase 1: Core Features ✅ COMPLETE
- [x] Real-time stock data
- [x] AI chat assistant
- [x] News sentiment analysis
- [x] Investment recommendations
- [x] Risk assessment
- [x] Deep analysis

### Phase 2: User Features (In Progress)
- [ ] User authentication (NextAuth setup ready)
- [ ] Watchlist management
- [ ] Portfolio tracking
- [ ] Price alerts
- [ ] Historical performance tracking

### Phase 3: Advanced Features
- [ ] Technical indicators (RSI, MACD, Bollinger Bands)
- [ ] Backtesting strategies
- [ ] Options analytics
- [ ] Mutual fund comparison
- [ ] IPO calendar & analysis

### Phase 4: Social Features
- [ ] Share analysis with friends
- [ ] Community discussions
- [ ] Expert insights marketplace
- [ ] Paper trading competitions

---

## 📝 Development Notes

### Build History
1. **Initial Setup**: Next.js 14 + TypeScript + TailwindCSS
2. **Stock API Integration**: Yahoo Finance via yahoo-finance2
3. **AI Integration**: Google Gemini Pro (later migrated to 2.5 Flash)
4. **UI Components**: Added shadcn/ui components
5. **AI Features**: Built 5 AI-powered endpoints
6. **Bug Fixes**: Fixed Suspense, model deprecation, missing routes
7. **Documentation**: Created comprehensive docs

### Key Decisions
- **Why Next.js 14?**: App Router, server components, better performance
- **Why Gemini?**: Free tier, powerful, easy integration
- **Why Yahoo Finance?**: Free, reliable, comprehensive data
- **Why Prisma?**: Type-safe, easy migrations, great DX
- **Why shadcn/ui?**: Unstyled primitives, full customization

### Known Limitations
1. **Stock data delay**: ~15 minutes for free tier (Yahoo Finance)
2. **AI rate limits**: Free tier has quota limits (Gemini)
3. **News sources**: Limited to Google News + NewsAPI
4. **Market hours**: Real-time only during market hours
5. **Exchanges**: Currently optimized for NSE/BSE (Indian markets)

---

## 🆘 Getting Help

### Internal Resources
- `AI_FEATURES.md` - AI features documentation
- `AI_MODEL_FIX.md` - Model migration guide
- `LIVE_DATA_VERIFICATION.md` - Data flow verification
- `.github/copilot-instructions.md` - Project context for AI

### External Resources
- Next.js Docs: https://nextjs.org/docs
- Gemini AI Docs: https://ai.google.dev/docs
- Yahoo Finance2 Docs: https://github.com/gadicc/node-yahoo-finance2
- Prisma Docs: https://www.prisma.io/docs
- shadcn/ui Docs: https://ui.shadcn.com

### Contact
- Repository: github.com/vaibhav31s/stockerrr
- Issues: <repo-url>/issues

---

## ✅ Quick Reference Checklist

**When Adding New Features**:
- [ ] Create API route in `src/app/api/`
- [ ] Use `gemini-2.5-flash` model (not gemini-pro)
- [ ] Add TypeScript types
- [ ] Include error handling
- [ ] Add loading states in UI
- [ ] Test with real data
- [ ] Update this documentation
- [ ] Add to API reference section

**When Modifying AI Features**:
- [ ] Check `AI_FEATURES.md` for current implementation
- [ ] Ensure live stockData is passed to AI
- [ ] Include timestamp in responses
- [ ] Test with different stock symbols
- [ ] Verify prompts reference current data
- [ ] Check model is `gemini-2.5-flash`

**When Debugging Issues**:
- [ ] Check browser console for errors
- [ ] Verify environment variables in `.env.local`
- [ ] Check API response in Network tab
- [ ] Review server logs in terminal
- [ ] Confirm database connection (if applicable)
- [ ] Check this documentation for common issues

---

**Last Updated**: October 3, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Development Phase)

---

**Remember**: This app uses LIVE data. Always verify data freshness with timestamps. Reference `LIVE_DATA_VERIFICATION.md` for data flow details.
