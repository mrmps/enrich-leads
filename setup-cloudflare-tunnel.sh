#!/bin/bash

# Quick setup script for Cloudflare Tunnel
echo "🚀 Setting up Cloudflare Tunnel for Lead Finder"
echo "================================================"
echo ""

# Step 1: Login
echo "Step 1: Logging into Cloudflare..."
echo "This will open your browser. Choose your Cloudflare account."
echo ""
cloudflared tunnel login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Login successful!"
echo ""

# Step 2: Create tunnel
echo "Step 2: Creating permanent tunnel 'lead-finder'..."
echo ""
cloudflared tunnel create lead-finder

if [ $? -ne 0 ]; then
    echo "⚠️  Tunnel might already exist. That's okay!"
fi

echo ""

# Step 3: Get tunnel info
echo "Step 3: Getting tunnel details..."
echo ""
TUNNEL_INFO=$(cloudflared tunnel list | grep "lead-finder")
TUNNEL_ID=$(echo "$TUNNEL_INFO" | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
    echo "❌ Could not find tunnel. Please run 'cloudflared tunnel list' to see your tunnels."
    exit 1
fi

echo "✅ Tunnel ID: $TUNNEL_ID"
echo ""

# Step 4: Create config
echo "Step 4: Creating tunnel config..."
echo ""

CONFIG_DIR="$HOME/.cloudflared"
CONFIG_FILE="$CONFIG_DIR/config.yml"
CRED_FILE="$CONFIG_DIR/$TUNNEL_ID.json"

# Create config
cat > "$CONFIG_FILE" << EOF
tunnel: lead-finder
credentials-file: $CRED_FILE

ingress:
  - service: http://localhost:3000
EOF

echo "✅ Config created at $CONFIG_FILE"
echo ""

# Step 5: Show tunnel URL
TUNNEL_URL=$(cloudflared tunnel info lead-finder 2>/dev/null | grep -o 'https://[^ ]*' | head -1)

if [ -z "$TUNNEL_URL" ]; then
    # Construct URL manually if info command doesn't work
    TUNNEL_URL="https://$TUNNEL_ID.cfargotunnel.com"
fi

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ Setup Complete! ✅                            ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Your permanent tunnel URL:"
echo "   $TUNNEL_URL"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start your tunnel:"
echo "   pnpm cf:tunnel"
echo "   (or: cloudflared tunnel run lead-finder)"
echo ""
echo "2. Start your dev server (in another terminal):"
echo "   pnpm dev:simple"
echo ""
echo "3. Update your .env file:"
echo "   WEBHOOK_URL=\"$TUNNEL_URL/api/webhook\""
echo ""
echo "4. Update Parallel.ai webhook URL to:"
echo "   $TUNNEL_URL/api/webhook"
echo ""
echo "💡 This tunnel URL is PERMANENT and will never change!"
echo ""
