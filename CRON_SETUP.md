# Daily Stock Snapshot System

## Overview
This system automatically stores daily stock price snapshots at 4 PM IST (Indian market close time) for all stocks in users' watchlists.

## How It Works

### 1. Database Storage
- Uses `StockData` table in Prisma schema
- Stores OHLCV (Open, High, Low, Close, Volume) data
- Each snapshot has a timestamp and timeframe ('1d')
- Prevents duplicate snapshots for the same day

### 2. API Endpoints

#### `/api/stocks/snapshot` (POST)
Stores a snapshot for a single stock
```bash
curl -X POST http://localhost:3001/api/stocks/snapshot \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE"}'
```

#### `/api/stocks/snapshot` (PUT)
Batch stores snapshots for multiple stocks
```bash
curl -X PUT http://localhost:3001/api/stocks/snapshot \
  -H "Content-Type: application/json" \
  -d '{"symbols":["RELIANCE","TCS","INFY"]}'
```

#### `/api/stocks/history/[symbol]` (GET)
Fetches historical data for a stock
```bash
curl "http://localhost:3001/api/stocks/history/RELIANCE?days=30"
```

#### `/api/cron/daily-snapshot` (GET)
Daily cron job endpoint - **Protected by Bearer token**
```bash
curl "http://localhost:3001/api/cron/daily-snapshot" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Automated Daily Snapshots

The system runs automatically at **4:00 PM IST (10:30 AM UTC)** every day.

#### Deployment Options:

**Option A: Vercel Cron (Recommended for Vercel deployments)**
- Configured in `vercel.json`
- Runs automatically on Vercel
- No external setup needed

**Option B: GitHub Actions**
Create `.github/workflows/daily-snapshot.yml`:
```yaml
name: Daily Stock Snapshot
on:
  schedule:
    - cron: '30 10 * * *'  # 4 PM IST = 10:30 AM UTC
  workflow_dispatch:

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger snapshot
        run: |
          curl -X GET "${{ secrets.APP_URL }}/api/cron/daily-snapshot" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

**Option C: EasyCron or Cron-Job.org**
1. Sign up at [EasyCron](https://www.easycron.com/) or [Cron-Job.org](https://cron-job.org/)
2. Create a new cron job:
   - URL: `https://your-app.vercel.app/api/cron/daily-snapshot`
   - Schedule: `30 10 * * *` (10:30 AM UTC = 4 PM IST)
   - Method: GET
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local`:
```bash
DATABASE_URL="your-postgres-connection-string"
DIRECT_URL="your-direct-postgres-url"
CRON_SECRET="generate-a-secure-random-string"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### 2. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

### 3. Manual Snapshot (for testing)
```bash
# Single stock
curl -X POST http://localhost:3001/api/stocks/snapshot \
  -H "Content-Type: application/json" \
  -d '{"symbol":"RELIANCE"}'

# Multiple stocks
curl -X PUT http://localhost:3001/api/stocks/snapshot \
  -H "Content-Type: application/json" \
  -d '{"symbols":["RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK"]}'
```

### 4. Test Cron Endpoint
```bash
export CRON_SECRET="your-secret-here"
curl "http://localhost:3001/api/cron/daily-snapshot" \
  -H "Authorization: Bearer $CRON_SECRET"
```

## How Watchlist Uses Historical Data

1. **User adds stocks to watchlist** → Stored in localStorage + Prisma DB
2. **Daily at 4 PM IST** → Cron job runs and stores snapshots
3. **User views watchlist** → Fetches real historical data from DB
4. **If no DB data** → Falls back to simulated data

### Data Priority:
1. **1D Period**: Always uses live API data (Yahoo Finance)
2. **1W-1Y Periods**: 
   - ✅ Real historical data from DB (if available)
   - ⚠️ Simulated data (if DB empty)

## Benefits

✅ **Accurate Performance Tracking** - Real historical data, not simulations  
✅ **Cross-Device Sync** - Data stored in database, accessible anywhere  
✅ **No API Quota Issues** - Only fetches once per day  
✅ **Trend Analysis** - Build up historical data over time  
✅ **Compliance** - Respects market hours (4 PM IST = market close)  

## Monitoring

Check the cron job logs:
```bash
# View recent snapshots
npx prisma studio
# Navigate to StockData table
```

Query snapshots:
```sql
SELECT 
  sd.symbol, 
  sd.close, 
  sd.timestamp,
  s.name
FROM "StockData" sd
JOIN "Stock" s ON sd."stockId" = s.id
WHERE sd.timeframe = '1d'
ORDER BY sd.timestamp DESC
LIMIT 20;
```

## Troubleshooting

**Problem**: Cron not running  
**Solution**: Check Vercel deployment logs or GitHub Actions logs

**Problem**: Unauthorized error  
**Solution**: Ensure `CRON_SECRET` matches in env and request header

**Problem**: No historical data  
**Solution**: Run manual snapshot or wait for first cron execution

**Problem**: Duplicate snapshots  
**Solution**: The system prevents duplicates automatically

## Future Enhancements

- [ ] Intraday data (5min, 15min, 1hour intervals)
- [ ] Backfill historical data (fetch last 1 year of data)
- [ ] Email notifications on cron success/failure
- [ ] Dashboard to view snapshot status
- [ ] Support for BSE stocks (currently NSE only)
- [ ] WebSocket real-time updates during market hours
