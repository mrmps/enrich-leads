#!/bin/bash

# Lead Finder - Development Startup Script
# Starts ngrok tunnel and Next.js dev server with updated webhook URL

echo "🚀 Starting Lead Finder..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Please install it:"
    echo "   brew install ngrok"
    exit 1
fi

# Kill any existing ngrok processes
pkill -f "ngrok http" 2>/dev/null
sleep 1

# Start ngrok in background
echo "🌐 Starting ngrok tunnel..."
ngrok http 3000 > /dev/null 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Is ngrok running?"
    echo "   Try running manually: ngrok http 3000"
    exit 1
fi

echo "✅ ngrok tunnel created: $NGROK_URL"

# Update .env file
WEBHOOK_URL="${NGROK_URL}/api/webhook"

if [ -f .env ]; then
    # Update existing .env
    if grep -q "WEBHOOK_URL=" .env; then
        # Replace existing WEBHOOK_URL
        sed -i.bak "s|WEBHOOK_URL=.*|WEBHOOK_URL=\"${WEBHOOK_URL}\"|" .env
    else
        # Add WEBHOOK_URL if it doesn't exist
        echo "WEBHOOK_URL=\"${WEBHOOK_URL}\"" >> .env
    fi
    echo "✅ Updated .env with webhook URL"
else
    echo "⚠️  .env file not found. Creating one..."
    cat > .env << EOF
DATABASE_URL="YOUR_DATABASE_URL_HERE"
PARALLEL_API_KEY="YOUR_PARALLEL_API_KEY_HERE"
WEBHOOK_URL="${WEBHOOK_URL}"
WEBHOOK_SECRET="your_webhook_secret_from_parallel_settings"

# Research prompt - easily editable
RESEARCH_PROMPT="Extract comprehensive company information including: company name, industry, founding date, employee count range, revenue information, key products/services, recent funding rounds, headquarters location, and key executives with their titles."
EOF
    echo "✅ Created .env file - please add your credentials"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                  🎉 Ready to go! 🎉                              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Public URL:    $NGROK_URL"
echo "📬 Webhook URL:   $WEBHOOK_URL"
echo "🏠 Local Server:  http://localhost:3000"
echo ""
echo "⚠️  Important:"
echo "   • ngrok is running in background (PID: $NGROK_PID)"
echo "   • To stop ngrok: pkill -f 'ngrok http'"
echo "   • Keep this terminal open while developing"
echo ""
echo "Starting Next.js dev server..."
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Start Next.js dev server
pnpm next dev --turbopack
