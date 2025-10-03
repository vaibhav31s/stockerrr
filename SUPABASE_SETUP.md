# Supabase Setup Guide for Stockkap

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `stockkap` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., US East for US users)
5. Click "Create new project"
6. Wait for the project to be ready (1-2 minutes)

## 2. Get Your Project Credentials

After your project is ready:

1. Go to **Settings** → **API**
2. Copy the following values to your `.env` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API Keys**:
     - **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

3. Go to **Settings** → **Database**
4. Copy the **Connection string** → `DATABASE_URL`
   - Use the "Pooler" connection for better performance
   - Also set `DIRECT_URL` to the direct connection (without pooler)

## 3. Configure Authentication Providers

### Google OAuth Setup:
1. In Supabase: **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
   - Set authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### GitHub OAuth Setup:
1. In Supabase: **Authentication** → **Providers** → **GitHub**
2. Enable GitHub provider
3. Add your GitHub OAuth app credentials:
   - Create OAuth app at [GitHub Developer Settings](https://github.com/settings/developers)
   - Set authorization callback URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## 4. Set Up Database Schema

Run Prisma migrations to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# (Optional) Seed database
npx prisma db seed
```

## 5. Environment Variables

Update your `.env` file with real values:

```env
# Database - Supabase
DATABASE_URL="postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.your-project-ref:your-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# OAuth Providers (from your Google/GitHub apps)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# API Keys
GEMINI_API_KEY="your-existing-key"
```

## 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test database connection:
   ```bash
   npx prisma studio
   ```

3. Test authentication by trying to sign up/sign in on your app

## 7. Deploy to Production

When deploying to Vercel:

1. Add all environment variables in Vercel dashboard
2. Update `NEXTAUTH_URL` to your production domain
3. Update OAuth redirect URIs to include your production domain
4. Supabase will automatically handle database migrations

## Features You Get with Supabase:

✅ **PostgreSQL Database** - Fully managed with connection pooling
✅ **Real-time Subscriptions** - Get live updates when data changes
✅ **Built-in Authentication** - Email, OAuth, magic links
✅ **Row Level Security (RLS)** - Database-level security policies
✅ **Auto-generated APIs** - REST and GraphQL endpoints
✅ **Storage** - File uploads and management
✅ **Edge Functions** - Serverless functions at the edge
✅ **Dashboard** - Visual database management and analytics

## Indian Stock Market Benefits:

- **Global CDN**: Fast data access for Indian users
- **Real-time Updates**: Live stock price changes via Supabase Realtime
- **Scalability**: Handle high traffic during market hours
- **Data Persistence**: Store user portfolios, watchlists, and preferences
- **Analytics**: Track user behavior and popular stocks

Your Stockkap platform is now ready with enterprise-grade database and authentication! 🚀