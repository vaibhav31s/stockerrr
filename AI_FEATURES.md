# 🤖 AI-Powered Investment Features

Stockkap now includes comprehensive AI-powered features using Google's Gemini Pro to help you make smarter investment decisions!

## 🎯 New AI Features

### 1. **AI Stock Chat Assistant** (`/api/ai/chat`)
- Real-time conversational AI for stock analysis
- Context-aware responses based on current stock data
- Ask questions about entry/exit points, risks, and market sentiment
- Maintains conversation history for better context

**Usage:**
```typescript
POST /api/ai/chat
{
  "message": "Is this a good time to buy TCS?",
  "stockData": { ...currentStockData },
  "context": [ ...previousMessages ]
}
```

### 2. **Deep Analysis** (`/api/ai/deep-analysis`)
Comprehensive investment analysis including:
- **Technical Analysis**: Trend, support/resistance levels, momentum
- **Fundamental Analysis**: Valuation, financial health, growth potential
- **Risk Assessment**: Overall risk score (0-10)
- **Key Insights**: AI-identified opportunities and concerns
- **Price Targets**: Short-term (1-3 months) and medium-term (6-12 months)
- **Investment Strategy**: Tailored recommendations

**Usage:**
```typescript
POST /api/ai/deep-analysis
{
  "symbol": "TCS",
  "stockData": { ...stockData },
  "newsData": { sentiment, score }
}
```

### 3. **Stock Comparison** (`/api/ai/compare`)
AI-powered side-by-side comparison of multiple stocks:
- Best value, growth, and lowest risk rankings
- Category-wise comparison (Valuation, Growth, Risk, Market Position)
- Recommendations based on investor profile (Aggressive/Moderate/Conservative)
- Detailed verdict on which stock to choose

**Usage:**
```typescript
POST /api/ai/compare
{
  "stocks": [
    { symbol: "TCS", price: 3500, ... },
    { symbol: "INFY", price: 1450, ... }
  ]
}
```

### 4. **Portfolio Optimization** (`/api/ai/portfolio-advice`)
Get AI recommendations for your entire portfolio:
- **Portfolio Health Score**: 0-10 rating with detailed assessment
- **Diversification Analysis**: How well-balanced is your portfolio
- **Risk Assessment**: Overall risk level and hedging strategies
- **Rebalancing Recommendations**: Which stocks to increase/reduce/hold
- **Watchlist Suggestions**: New stocks to consider adding
- **Action Plan**: Step-by-step optimization guide

**Usage:**
```typescript
POST /api/ai/portfolio-advice
{
  "portfolio": [ ...yourStocks ],
  "riskProfile": "Moderate",
  "investmentGoal": "Long-term wealth creation"
}
```

### 5. **Comprehensive Risk Score** (`/api/ai/risk-score`)
Detailed risk analysis with breakdowns:
- **Overall Risk Score**: 0-100 (lower is safer)
- **Risk Level**: Very Low / Low / Moderate / High / Very High
- **Risk Breakdown**:
  - Volatility Risk
  - Valuation Risk
  - Liquidity Risk
  - Market Risk
  - Sentiment Risk
- **Key Risks**: Identified with severity levels and mitigation strategies
- **Suitability Analysis**: Which investor types should/shouldn't invest

**Usage:**
```typescript
POST /api/ai/risk-score
{
  "symbol": "RELIANCE",
  "stockData": { ...stockData },
  "newsData": { sentiment, score }
}
```

## 🎨 UI Components

### **AIStockChat Component**
Interactive chat interface with:
- Message bubbles for user and AI responses
- Typing indicators during AI processing
- Scrollable chat history
- Context-aware conversations

```tsx
import { AIStockChat } from '@/components/ai-stock-chat'

<AIStockChat symbol="TCS" stockData={stockData} />
```

### **DeepAnalysis Component**
Tabbed interface showing:
- Overview (Rating, Risk Score, Key Insights)
- Technical Analysis (Trend, Support/Resistance)
- Fundamental Analysis (Valuation, Financial Health)
- Risks & Opportunities
- Investment Strategy & Conclusion

```tsx
import { DeepAnalysis } from '@/components/deep-analysis'

<DeepAnalysis symbol="TCS" stockData={stockData} newsData={newsData} />
```

## 📱 New Pages

### **/ai/analysis** - Comprehensive AI Analysis Page
Centralized hub for all AI features for a specific stock:
- Current stock overview
- AI chat assistant
- Risk analysis calculator
- Deep analysis generator
- Quick links to comparison and portfolio tools

**Access**: Click "AI Analysis" button on any stock card

## 🚀 How to Use

1. **Search for a stock** on the dashboard
2. Click the **"AI Analysis"** button on the stock card
3. **Chat with AI** about the stock in real-time
4. **Generate Deep Analysis** for comprehensive insights
5. **Calculate Risk Score** to understand investment risks
6. Use **Compare** feature to evaluate against other stocks
7. Get **Portfolio Advice** for your complete watchlist

## 💡 Pro Tips

1. **Ask Specific Questions**: Instead of "What do you think?", ask "What are the key risk factors for TCS right now?"

2. **Use Context**: The AI remembers your conversation, so you can ask follow-up questions

3. **Compare Before Buying**: Use the comparison tool to evaluate 2-3 similar stocks before making a decision

4. **Regular Portfolio Reviews**: Run portfolio advice monthly to stay optimized

5. **Check Risk Scores**: Always check the comprehensive risk score before investing significant amounts

## 🔧 Configuration

Ensure your `.env.local` has:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your free API key from: https://makersuite.google.com/app/apikey

## 📊 AI Analysis Flow

```
User searches stock → Stock data fetched → AI Analysis page
                                              ↓
                          ┌─────────────────────────────────┐
                          │  AI Chat  │  Risk Score  │  Deep Analysis  │
                          └─────────────────────────────────┘
                                              ↓
                          ┌─────────────────────────────────┐
                          │  Compare  │  Portfolio Advice  │
                          └─────────────────────────────────┘
                                              ↓
                                    Informed Decision ✅
```

## 🎯 What Makes This Special

1. **Context-Aware**: AI knows about Indian market dynamics (NSE/BSE)
2. **Data-Driven**: All insights based on real-time market data
3. **Comprehensive**: Covers technical, fundamental, and sentiment analysis
4. **Actionable**: Provides specific recommendations, not just generic advice
5. **Risk-Focused**: Helps you understand what could go wrong
6. **Portfolio-Level**: Looks at your complete investment picture

## 🔜 Coming Soon

- [ ] AI-powered alerts for portfolio changes
- [ ] Sector rotation recommendations
- [ ] Macro economic impact analysis
- [ ] AI-generated trading strategies
- [ ] Historical backtesting of AI recommendations

## 📝 Example Conversations

**User**: "Is TCS overvalued right now?"
**AI**: Based on the P/E ratio of 28.5 compared to industry average of 25, TCS is slightly overvalued. However, considering its strong fundamentals, consistent dividend history, and market leadership position, the premium is justified. Current price of ₹3,545 is near the 52-week high, suggesting you might wait for a 5-7% correction before entering.

**User**: "What's the risk in investing in small-cap stocks?"
**AI**: Small-cap stocks typically carry higher risks: 1) High volatility (20-30% swings common), 2) Low liquidity (harder to exit), 3) Limited financial data, 4) Greater business risk. However, they offer higher growth potential. For small-caps, limit exposure to 10-15% of portfolio and invest only in fundamentally strong companies with clear growth catalysts.

---

**Built with ❤️ using Google Gemini Pro AI**
