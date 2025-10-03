#!/bin/bash

# Clean Build Script - Fixes ESLint Cache Issues
# This script clears all caches and rebuilds from scratch

echo "🧹 Cleaning all caches..."

# 1. Remove Next.js build cache
echo "  ➜ Removing .next directory..."
rm -rf .next

# 2. Remove node_modules cache (optional, uncomment if needed)
# echo "  ➜ Removing node_modules..."
# rm -rf node_modules

# 3. Remove ESLint cache
echo "  ➜ Removing ESLint cache..."
rm -f .eslintcache

# 4. Clear pnpm cache (optional)
# echo "  ➜ Clearing pnpm cache..."
# pnpm store prune

echo "✅ Cache cleared!"
echo ""
echo "🔨 Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🚀 You can now run:"
    echo "   pnpm dev    (for development)"
    echo "   pnpm start  (for production)"
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi
