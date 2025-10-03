#!/bin/bash
# Robust Prisma deployment script for Vercel
# Handles both fresh and existing databases

set -e

echo "🔍 Starting Prisma deployment..."

# Function to run migration with error handling
deploy_migrations() {
    echo "🚀 Attempting to deploy migrations..."
    
    # Try to deploy migrations
    if npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log; then
        echo "✅ Migrations deployed successfully"
        return 0
    else
        # Check if it's the "prepared statement" error
        if grep -q "prepared statement" /tmp/migrate.log; then
            echo "⚠️  Detected prepared statement error, using db push instead..."
            return 1
        else
            echo "❌ Migration failed with unknown error"
            cat /tmp/migrate.log
            exit 1
        fi
    fi
}

# Try migration deploy first
if ! deploy_migrations; then
    echo "📝 Using prisma db push as fallback..."
    npx prisma db push --accept-data-loss --skip-generate
    echo "✅ Database schema pushed"
fi

# Always generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

echo "🎉 Prisma deployment completed!"
