# 🚀 Deployment Guide - Stockkap

## Environment Configuration for Different Environments

### 🏠 Local Development (Port 3000)

**`.env.local`** configuration:
```bash
# Database (use Supabase free tier or local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/stockkap"
DIRECT_URL="postgresql://user:password@localhost:5432/stockkap"

# NextAuth - Local Development
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# API Keys
GEMINI_API_KEY="your-api-key"
ALPHA_VANTAGE_API_KEY="your-api-key"
FINNHUB_API_KEY="your-api-key"
```

**Start development server:**
```bash
pnpm dev
# Server runs at http://localhost:3000
```

---

### ☁️ Production Deployment (Vercel/Netlify/etc.)

#### Option 1: Vercel (Recommended)

**Step 1: Set Environment Variables in Vercel Dashboard**

Go to: `Project Settings → Environment Variables`

Add these variables:

```bash
# Database (Supabase/Neon recommended for production)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# NextAuth - Vercel automatically sets NEXTAUTH_URL
# But you can override it:
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"

# API Keys
GEMINI_API_KEY="your-production-api-key"
ALPHA_VANTAGE_API_KEY="your-production-api-key"
FINNHUB_API_KEY="your-production-api-key"
```

**Step 2: Deploy**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important**: Vercel automatically detects your deployment URL and sets `NEXTAUTH_URL` if you don't provide it.

---

#### Option 2: Custom Server (Docker/VPS)

**Step 1: Create `.env` file on your server**

```bash
# Use your actual production domain
NEXTAUTH_URL="https://stockkap.com"
NEXTAUTH_SECRET="your-super-secret-production-key"

DATABASE_URL="postgresql://user:password@db-host:5432/database"
DIRECT_URL="postgresql://user:password@db-host:5432/database"

GEMINI_API_KEY="your-api-key"
ALPHA_VANTAGE_API_KEY="your-api-key"
FINNHUB_API_KEY="your-api-key"
```

**Step 2: Build and run**
```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
# Server runs at http://localhost:3000
```

**Step 3: Use a reverse proxy (Nginx/Apache)**

Nginx example:
```nginx
server {
    listen 80;
    server_name stockkap.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 🔐 How NextAuth Handles URLs Dynamically

**Good news!** The middleware and ProtectedRoute components use **relative URLs** (`/auth/login`), which means:

1. **In Development**: Redirects to `http://localhost:3000/auth/login`
2. **In Production**: Redirects to `https://yourdomain.com/auth/login`

**How it works:**
- NextAuth automatically uses `NEXTAUTH_URL` as the base URL
- All redirects are relative (`/auth/login` not `http://localhost:3001/auth/login`)
- This makes your app portable across environments

---

## 🧪 Testing Before Deployment

### Test 1: Change Port to 3000
```bash
# 1. Update .env.local
NEXTAUTH_URL="http://localhost:3000"

# 2. Update package.json (if needed)
# Find: "dev": "next dev -p 3001"
# Change to: "dev": "next dev"

# 3. Restart server
pnpm dev
```

### Test 2: Clear Cookies & Test Auth
```bash
# 1. Open browser in Incognito mode
# 2. Visit http://localhost:3000/dashboard
# 3. Should redirect to http://localhost:3000/auth/login ✅
```

### Test 3: Login Flow
```bash
# 1. Signup at /auth/signup
# 2. Should redirect to /dashboard
# 3. Logout
# 4. Try accessing /dashboard
# 5. Should redirect to /auth/login ✅
```

---

## 📋 Deployment Checklist

### Before Deploying:

- [ ] Generate new `NEXTAUTH_SECRET` for production
  ```bash
  openssl rand -base64 32
  ```

- [ ] Set `NEXTAUTH_URL` to your production domain
  ```bash
  # Vercel: https://your-app.vercel.app
  # Custom: https://yourdomain.com
  ```

- [ ] Update database to production PostgreSQL
  ```bash
  # Use Supabase, Neon, Railway, or AWS RDS
  DATABASE_URL="postgresql://..."
  ```

- [ ] Set all API keys in production environment variables

- [ ] Run database migrations
  ```bash
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] Test authentication in production

### After Deploying:

- [ ] Visit your domain (e.g., `https://stockkap.vercel.app`)
- [ ] Test unauthenticated access to `/dashboard` → Should redirect to `/auth/login`
- [ ] Test signup flow → Should create account and login
- [ ] Test login flow → Should access dashboard
- [ ] Test logout → Should redirect to login
- [ ] Test all protected routes

---

## 🌐 Environment Variable Priority

NextAuth checks URLs in this order:

1. **`NEXTAUTH_URL`** environment variable (highest priority)
2. **`VERCEL_URL`** (automatic on Vercel)
3. **Request headers** (`host` + protocol)

**Recommendation**: Always set `NEXTAUTH_URL` explicitly in production.

---

## 🔧 Quick Fixes for Common Issues

### Issue: Redirects to wrong URL in production

**Solution**: Set `NEXTAUTH_URL` in production environment variables
```bash
NEXTAUTH_URL="https://your-actual-domain.com"
```

### Issue: Infinite redirect loop

**Solution**: Check that `NEXTAUTH_URL` matches your actual domain
```bash
# Wrong
NEXTAUTH_URL="http://localhost:3000"  # In production

# Correct
NEXTAUTH_URL="https://stockkap.vercel.app"  # In production
```

### Issue: CORS errors in production

**Solution**: Update `next.config.js` to allow your domain
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXTAUTH_URL },
        ],
      },
    ]
  },
}
```

---

## 📊 Environment Comparison

| Environment | NEXTAUTH_URL | Database | Port |
|-------------|-------------|----------|------|
| **Local Dev** | `http://localhost:3000` | Supabase/Local | 3000 |
| **Vercel Preview** | Auto-detected | Production DB | N/A |
| **Vercel Prod** | `https://yourdomain.com` | Production DB | N/A |
| **Custom VPS** | `https://yourdomain.com` | Production DB | 3000 |

---

## 🎯 Current Configuration Status

✅ **Fixed**: `NEXTAUTH_URL` changed from `localhost:3001` → `localhost:3000`  
✅ **Correct**: Middleware uses relative URLs (`/auth/login`)  
✅ **Correct**: ProtectedRoute uses relative URLs  
✅ **Production Ready**: Will work on any domain when `NEXTAUTH_URL` is set

---

## 🚀 Deploy to Vercel (Quick Start)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Set environment variables in Vercel dashboard
# Go to: https://vercel.com/your-username/stockkap/settings/environment-variables

# 5. Redeploy
vercel --prod
```

**Environment Variables to Set in Vercel:**
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET` (generate new one!)
- `NEXTAUTH_URL` (optional, Vercel auto-detects)
- `GEMINI_API_KEY`
- `ALPHA_VANTAGE_API_KEY`
- `FINNHUB_API_KEY`

---

**Last Updated**: October 3, 2025  
**Status**: ✅ Ready for Production Deployment  
**Next Steps**: Set environment variables in your hosting platform
