#!/bin/bash

# Stockkap Authentication Setup Script

echo "🔐 Stockkap Authentication Setup"
echo "================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file found"
else
    echo "📝 Creating .env.local from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo "✅ Created .env.local"
    else
        echo "⚠️  .env.example not found. Creating new .env.local..."
        touch .env.local
    fi
fi

echo ""
echo "🔑 Generating NEXTAUTH_SECRET..."
echo ""

# Generate a secure random secret
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "Generated secret: $SECRET"
    echo ""
    
    # Check if NEXTAUTH_SECRET already exists in .env.local
    if grep -q "NEXTAUTH_SECRET=" .env.local; then
        echo "⚠️  NEXTAUTH_SECRET already exists in .env.local"
        read -p "Do you want to replace it? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Replace existing NEXTAUTH_SECRET
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
            else
                # Linux
                sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
            fi
            echo "✅ NEXTAUTH_SECRET updated in .env.local"
        fi
    else
        # Add NEXTAUTH_SECRET
        echo "" >> .env.local
        echo "# NextAuth Configuration" >> .env.local
        echo "NEXTAUTH_SECRET=\"$SECRET\"" >> .env.local
        echo "NEXTAUTH_URL=\"http://localhost:3001\"" >> .env.local
        echo "✅ NEXTAUTH_SECRET added to .env.local"
    fi
else
    echo "⚠️  openssl not found. Please install openssl or manually generate a secret."
    echo ""
    echo "Alternative: Visit https://generate-secret.vercel.app/32"
    echo "Then add to .env.local:"
    echo "NEXTAUTH_SECRET=\"your_generated_secret\""
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your DATABASE_URL is set in .env.local"
echo "2. Make sure your GEMINI_API_KEY is set in .env.local"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3001/auth/signup to create an account"
echo ""
