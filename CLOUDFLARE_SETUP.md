# Cloudflare Tunnel Setup - FREE Static URL Forever!

## One-Time Setup (5 minutes)

### Step 1: Install cloudflared
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Step 2: Login to Cloudflare (creates credentials)
```bash
cloudflared tunnel login
```
This will open a browser - choose your Cloudflare account (or create a free one).

### Step 3: Create a Named Tunnel
```bash
cloudflared tunnel create lead-finder
```
This gives you a **permanent tunnel ID** that never changes!

### Step 4: Configure the Tunnel
Create a config file at `~/.cloudflared/config.yml`:
```yaml
tunnel: lead-finder
credentials-file: /Users/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: YOUR_SUBDOMAIN.YOUR_DOMAIN.com
    service: http://localhost:3000
  - service: http_status:404
```

### Step 5: Create DNS Record
```bash
cloudflared tunnel route dns lead-finder YOUR_SUBDOMAIN.YOUR_DOMAIN.com
```

### Step 6: Run the Tunnel
```bash
cloudflared tunnel run lead-finder
```

## OR: Use Quick Tunnel (Temporary but Free)

Just run:
```bash
./start-dev-cloudflare.sh
```

This gives you a URL like `https://random-words-xyz.trycloudflare.com` that changes each time, BUT it's free and works great for development!

## Comparison

| Option | Cost | Static URL | Setup Time |
|--------|------|------------|------------|
| ngrok free | Free | ❌ Random | 1 min |
| ngrok paid | $8/mo+ | ✅ Static | 2 min |
| **Cloudflare Named** | **FREE** | **✅ Static** | **5 min** |
| Cloudflare Quick | FREE | ❌ Random | 1 min |
| localhost.run | FREE | ❌ Random | 30 sec |

## Recommendation

**For serious development:** Set up Cloudflare Named Tunnel (Steps 1-6 above)
**For quick testing:** Use `./start-dev-cloudflare.sh` or keep using ngrok
