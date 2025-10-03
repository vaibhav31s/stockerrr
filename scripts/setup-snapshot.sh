#!/bin/bash

# Daily Stock Snapshot Setup Script

echo "🚀 Setting up Daily Stock Snapshot System..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "⚠️  .env.local not found. Creating from .env.example..."
  cp .env.example .env.local
fi

# Generate a secure CRON_SECRET if not set
if ! grep -q "CRON_SECRET=" .env.local; then
  echo "🔐 Generating secure CRON_SECRET..."
  CRON_SECRET=$(openssl rand -base64 32)
  echo "CRON_SECRET=\"$CRON_SECRET\"" >> .env.local
  echo "✅ CRON_SECRET added to .env.local"
else
  echo "✅ CRON_SECRET already exists"
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local || grep -q "DATABASE_URL=\"\"" .env.local; then
  echo ""
  echo "⚠️  DATABASE_URL not configured!"
  echo "Please add your Supabase/PostgreSQL connection string to .env.local"
  echo "Example: DATABASE_URL=\"postgresql://user:password@host:5432/database\""
  echo ""
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure DATABASE_URL in .env.local (if not done)"
echo "2. Run: npx prisma db push (to create database tables)"
echo "3. Test snapshot: npm run snapshot-test"
echo "4. Deploy to Vercel for automatic daily snapshots"
echo ""
echo "📖 Read CRON_SETUP.md for full documentation"
