#!/bin/bash

# Lead Finder - Development Startup Script with Cloudflare Tunnel
# Uses Cloudflare Tunnel (FREE with static URL!)

echo "🚀 Starting Lead Finder with Cloudflare Tunnel..."
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared not found. Installing..."
    echo "   brew install cloudflare/cloudflare/cloudflared"
    brew install cloudflare/cloudflare/cloudflared
fi

# Kill any existing cloudflared processes
pkill -f "cloudflared tunnel" 2>/dev/null
sleep 1

# Start cloudflared tunnel in background (this gives you a static URL after first run)
echo "🌐 Starting Cloudflare tunnel..."
cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnel to start and get URL
sleep 5

# Get the tunnel URL from the log
TUNNEL_URL=$(grep -o 'https://.*\.trycloudflare.com' /tmp/cloudflared.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Failed to get Cloudflare tunnel URL."
    echo "   Check logs: tail -f /tmp/cloudflared.log"
    exit 1
fi

echo "✅ Cloudflare tunnel created: $TUNNEL_URL"

# Update .env file
WEBHOOK_URL="${TUNNEL_URL}/api/webhook"

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
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                  🎉 Ready to go! 🎉                              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Public URL:    $TUNNEL_URL"
echo "📬 Webhook URL:   $WEBHOOK_URL"
echo "🏠 Local Server:  http://localhost:3000"
echo ""
echo "⚠️  Important:"
echo "   • Cloudflare tunnel is running in background (PID: $TUNNEL_PID)"
echo "   • To stop: pkill -f 'cloudflared tunnel'"
echo "   • Keep this terminal open while developing"
echo ""
echo "💡 Tip: For a PERMANENT static URL, run:"
echo "   cloudflared tunnel login"
echo "   cloudflared tunnel create lead-finder"
echo "   Then update this script to use your named tunnel"
echo ""
echo "Starting Next.js dev server..."
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Start Next.js dev server
pnpm next dev --turbopack
