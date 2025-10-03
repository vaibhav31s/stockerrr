#!/bin/bash
# Prisma migration script for Vercel deployment
# This handles both new and existing databases

set -e

echo "🔍 Checking migration status..."

# Check if the database has been migrated before
if npx prisma migrate status 2>&1 | grep -q "No migration found"; then
  echo "📝 No migrations found. Baselining existing database..."
  # Mark current migration as already applied without running it
  npx prisma migrate resolve --applied 20251003225016_initial_schema
  echo "✅ Database baselined"
elif npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
  echo "✅ Database is already up to date"
else
  echo "🚀 Deploying pending migrations..."
  npx prisma migrate deploy
  echo "✅ Migrations deployed"
fi

echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
