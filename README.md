# 🇮🇳 Stockkap - AI-Powered Indian Stock Market Analysis Platform

A comprehensive **Indian stock market** analysis platform built with **Next.js 14**, **TypeScript**, and **AI-powered insights** using Google's **Gemini Pro**. Focused on **NSE & BSE** stocks with Indian market context.

## ✨ Features

- 📊 **Real-time Indian Stock Data** - Live NSE/BSE quotes, charts, and market data
- 🤖 **AI-Powered Analysis** - Intelligent insights using Google Gemini Pro with Indian market context
- 📰 **Indian Market News** - Sentiment analysis from Economic Times, Moneycontrol, Business Today
- 🎯 **Investment Recommendations** - AI-generated buy/hold/sell recommendations for Indian stocks
- 📈 **Interactive Charts** - Beautiful INR-based data visualizations with Recharts
- � **Indian Currency Support** - All prices displayed in INR (₹)
- 🏛️ **Market Context** - RBI policy, FII/DII flows, government policies impact analysis
- 📋 **Indian Stock Watchlists** - Track your favorite NSE/BSE stocks
- 🌙 **Dark/Light Mode** - Responsive design with theme switching

## 🛠️ Tech Stack

### Frontend & Backend
- **Next.js 14** (App Router) - Full-stack React framework
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework  
- **shadcn/ui** - Beautiful UI component library

### Database & Authentication
- **Supabase** - Backend-as-a-Service with PostgreSQL, Authentication & Real-time features
- **PostgreSQL** - Robust relational database (via Supabase)
- **Prisma ORM** - Type-safe database access
- **NextAuth.js** - Authentication solution
- **Supabase Auth** - OAuth providers (Google, GitHub) and email authentication

### AI & APIs
- **Google Gemini Pro** - AI-powered insights and sentiment analysis with Indian market context
- **Yahoo Finance API** - Real-time NSE/BSE stock data
- **Indian News Sources** - Economic Times, Moneycontrol, Business Today, Mint, Financial Express
- **Alpha Vantage** - Additional Indian market data (optional)
- **Finnhub API** - Indian financial data (optional)

### Charts & Visualization
- **Recharts** - Interactive charts and graphs
- **Lucide React** - Beautiful icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (free tier available)
- Google Gemini Pro API key

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd stockkap
npm install
# or
pnpm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stockkap"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI API Keys
GEMINI_API_KEY="your-gemini-api-key"
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-api-key" # Optional
FINNHUB_API_KEY="your-finnhub-api-key" # Optional
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Optional: View database in Prisma Studio
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 📁 Project Structure

```
stockkap/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── stocks/        # Stock data API
│   │   │   ├── news/          # News & sentiment API
│   │   │   └── insights/      # AI insights API
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── stock-card.tsx    # Stock data display
│   │   ├── news-card.tsx     # News with sentiment
│   │   └── insights-card.tsx # AI insights
│   ├── lib/                  # Utilities
│   │   ├── prisma.ts         # Database client
│   │   └── utils.ts          # Helper functions
│   └── hooks/                # Custom React hooks
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
└── ...config files
```

## 🔧 API Routes

### Stock Data
- `GET /api/stocks/[symbol]` - Get real-time stock data
  ```json
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 150.25,
    "change": 2.15,
    "changePercent": 1.45
  }
  ```

### News & Sentiment
- `GET /api/news/[symbol]` - Get news with AI sentiment analysis
  ```json
  {
    "symbol": "AAPL",
    "articles": [
      {
        "title": "Apple Reports Strong Q3 Earnings",
        "sentiment": {
          "score": 0.8,
          "label": "positive",
          "confidence": 0.9
        }
      }
    ]
  }
  ```

### AI Insights  
- `GET /api/insights/[symbol]` - Get comprehensive AI analysis
  ```json
  {
    "symbol": "AAPL",
    "insights": {
      "recommendation": "Buy",
      "confidence": 0.85,
      "targetPrice": 165.00,
      "keyInsights": ["Strong earnings growth", "Market leadership"]
    }
  }
  ```

## 🎨 UI Components

Built with **shadcn/ui** for consistent, accessible design:
- `Button` - Interactive buttons with variants
- `Card` - Content containers with headers/footers  
- `Input` - Form inputs with validation
- `Skeleton` - Loading placeholders
- `Toast` - Notification messages

## 🤖 AI Features

### Sentiment Analysis
- Analyzes news headlines and descriptions
- Provides sentiment scores (-1 to 1)
- Confidence ratings for accuracy

### Investment Insights
- Buy/Hold/Sell recommendations
- Price targets with upside/downside calculations
- Risk assessment and key insights
- Technical analysis summaries

## 🔐 Authentication

Supports multiple OAuth providers:
- **Google** - Sign in with Google account
- **GitHub** - Sign in with GitHub account
- Secure session management with NextAuth.js
- Database-stored user profiles and preferences

## 📊 Database Schema

Key models:
- **User** - User profiles and authentication
- **Stock** - Stock information and metadata  
- **StockData** - Historical price/volume data
- **NewsArticle** - News articles with metadata
- **SentimentScore** - AI sentiment analysis results
- **AIInsight** - Generated investment insights
- **Watchlist** - User stock watchlists

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables for Production
Ensure all environment variables are configured in your deployment platform.

### Database
- **Neon** - Serverless PostgreSQL (recommended)
- **Supabase** - PostgreSQL with additional features
- **Railway** - Simple PostgreSQL hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`  
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Google Gemini Pro** for AI capabilities
- **Yahoo Finance** for stock data
- **shadcn/ui** for beautiful components
- **Vercel** for seamless deployment

---

**Built with ❤️ using Next.js and AI**