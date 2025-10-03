# Historical Stock Data Snapshots

## Overview
This system stores daily stock snapshots at 4 PM IST to provide real historical data for watchlist performance tracking.

## How It Works

### 1. **Auto-Sync on Page Load**
When you open the watchlist page, the system automatically:
- Checks if today's snapshot exists for your watchlist stocks
- If missing, syncs the data immediately (no matter the time)
- Uses real database data when available
- Falls back to simulated data if historical data is not available

### 2. **Manual Sync Button**
You can manually trigger a snapshot sync at any time using the "Sync Today's Data" button in the watchlist page.

### 3. **Automatic Daily Sync (4 PM IST)**
**Option A: Using Vercel Cron (Recommended for Production)**
1. Deploy to Vercel
2. The `vercel.json` file is already configured to run at 4 PM IST (10:30 AM UTC)
3. Set environment variable: `CRON_SECRET=your-secret-key`
4. The cron will automatically run daily

**Option B: Using External Cron Service**
1. Use a service like cron-job.org or GitHub Actions
2. Schedule a POST request to: `https://your-app.com/api/stocks/snapshot`
3. Set the schedule to run at 4 PM IST
4. Include authentication headers

**Option C: Local Development**
For local testing, you can manually call the sync endpoint:
```bash
curl -X POST http://localhost:3001/api/stocks/snapshot \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["TCS", "HDFCBANK", "RELIANCE"]}'
```

## Database Schema

The system uses Supabase `stock_snapshots` table:
```sql
CREATE TABLE stock_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  change DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  market_cap BIGINT,
  snapshot_date DATE NOT NULL,
  snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, symbol, snapshot_date)
);

CREATE INDEX idx_stock_snapshots_user_symbol ON stock_snapshots(user_id, symbol, snapshot_date);
```

## API Endpoints

### POST /api/stocks/snapshot
Saves a snapshot of stock prices for the current user.

**Request:**
```json
{
  "symbols": ["TCS", "HDFCBANK", "RELIANCE"]
}
```

**Response:**
```json
{
  "success": true,
  "saved": 3,
  "failed": 0,
  "snapshots": [...]
}
```

### GET /api/stocks/snapshot
Checks if today's snapshot exists for given symbols.

**Request:**
```
GET /api/stocks/snapshot?symbols=TCS,HDFCBANK,RELIANCE
```

**Response:**
```json
{
  "date": "2025-10-03",
  "total": 3,
  "existing": 2,
  "missing": 1,
  "missingSymbols": ["RELIANCE"],
  "needsSync": true
}
```

### GET /api/stocks/historical
Fetches historical price data for a specific stock.

**Request:**
```
GET /api/stocks/historical?symbol=TCS&daysAgo=7
```

**Response:**
```json
{
  "found": true,
  "symbol": "TCS",
  "price": 2890.50,
  "change": -15.30,
  "changePercent": -0.53,
  "date": "2025-09-26",
  "daysAgo": 7
}
```

## Benefits

1. **Accurate Historical Data**: Real price data instead of simulations
2. **Cross-Device Sync**: Works across all your devices (when logged in)
3. **Performance Tracking**: Track actual gains/losses over time
4. **Auto-Healing**: Missing data is synced automatically when you view the watchlist
5. **Offline First**: Works with simulated data if database is unavailable

## Setup Instructions

1. **Database Setup** (Already done via Supabase)
   - Table `stock_snapshots` is created in Supabase
   - Indexes are configured for performance

2. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   CRON_SECRET=your_cron_secret_key
   NEXT_PUBLIC_APP_URL=https://your-app.com
   ```

3. **Deploy to Vercel**
   - Push code to GitHub
   - Import to Vercel
   - Cron jobs will automatically be enabled

4. **Test the System**
   - Add stocks to your watchlist
   - Watchlist page will auto-sync on first load
   - Switch between time periods (1D, 1W, 1M, etc.)
   - Check for "Using real historical data" badge

## Monitoring

Check the browser console for sync status:
- "Auto-sync completed: {...}"
- "Today's data already exists"
- "Using real historical data: true"
- "Loaded watchlist from localStorage: [...]"

## Troubleshooting

**Issue**: Data not syncing
- Check browser console for errors
- Verify you're logged in (Supabase auth)
- Check network tab for API call failures

**Issue**: Simulated data showing instead of real data
- Historical data may not exist yet (wait for daily cron or manual sync)
- System automatically falls back to simulated data if real data unavailable

**Issue**: Cron not running
- Verify `CRON_SECRET` environment variable is set
- Check Vercel cron logs in Vercel dashboard
- Ensure `vercel.json` is in project root
