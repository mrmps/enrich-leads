# Deploy Lead Finder to Cloudflare Pages + Permanent Tunnel

This guide will help you deploy your app to Cloudflare Pages AND set up a permanent tunnel for local development webhooks.

## Part 1: Set Up Permanent Tunnel (For Local Development)

### Step 1: Login to Cloudflare
```bash
cloudflared tunnel login
```
This opens your browser - choose your Cloudflare account (or create a free one).

### Step 2: Create a Named Tunnel
```bash
cloudflared tunnel create lead-finder
```
✅ This creates a **permanent tunnel** that never changes!

You'll see output like:
```
Created tunnel lead-finder with id XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

### Step 3: Create Tunnel Config
Create `~/.cloudflared/config.yml`:
```yaml
tunnel: lead-finder
credentials-file: /Users/YOUR_USERNAME/.cloudflared/TUNNEL_ID.json

ingress:
  - service: http://localhost:3000
```

**Replace:**
- `YOUR_USERNAME` with your actual username
- `TUNNEL_ID.json` with the actual filename from Step 2

### Step 4: Start the Tunnel
```bash
pnpm cf:tunnel
```
Or manually:
```bash
cloudflared tunnel run lead-finder
```

✅ Your tunnel URL will be: `https://lead-finder-TUNNEL_ID.trycloudflare.com`
This URL is **permanent** and never changes!

### Step 5: Update Your .env
Add the permanent tunnel URL to your `.env`:
```bash
WEBHOOK_URL="https://lead-finder-TUNNEL_ID.trycloudflare.com/api/webhook"
```

---

## Part 2: Deploy to Cloudflare Pages (Production)

### Option A: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Click "Pages" → "Create a project"
   - Connect your GitHub repo
   - Select "lead-finder" repository

3. **Build Configuration:**
   ```
   Framework preset: Next.js
   Build command: pnpm build
   Build output directory: .next
   Root directory: /
   ```

4. **Environment Variables:**
   Add these in Cloudflare Pages dashboard:
   ```
   DATABASE_URL=your_neon_database_url
   PARALLEL_API_KEY=your_parallel_api_key
   OPENAI_API_KEY=your_openai_api_key
   WEBHOOK_SECRET=your_webhook_secret
   WEBHOOK_URL=https://your-app.pages.dev/api/webhook
   ```

5. **Deploy!**
   - Click "Save and Deploy"
   - Wait ~2 minutes
   - Your app will be live at `https://lead-finder-xxx.pages.dev`

### Option B: Deploy via CLI (Manual)

1. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```

2. **Build for Cloudflare:**
   ```bash
   pnpm build:cf
   ```

3. **Deploy:**
   ```bash
   pnpm deploy
   ```

4. **Set Environment Variables:**
   ```bash
   npx wrangler pages project create lead-finder
   npx wrangler pages secret put DATABASE_URL --project-name lead-finder
   npx wrangler pages secret put PARALLEL_API_KEY --project-name lead-finder
   npx wrangler pages secret put OPENAI_API_KEY --project-name lead-finder
   npx wrangler pages secret put WEBHOOK_SECRET --project-name lead-finder
   ```

---

## Part 3: Update Parallel.ai Webhook URL

Once deployed, update your Parallel.ai webhook URL to point to:
- **Production:** `https://your-app.pages.dev/api/webhook`
- **Local Dev:** `https://lead-finder-TUNNEL_ID.trycloudflare.com/api/webhook`

---

## Development Workflow

### For Local Development (with permanent tunnel):
```bash
# Terminal 1: Start Cloudflare Tunnel
pnpm cf:tunnel

# Terminal 2: Start Next.js Dev Server
pnpm dev:simple
```

Your webhooks will work at the permanent tunnel URL! 🎉

### To Preview Production Build Locally:
```bash
pnpm build:cf
pnpm preview
```

---

## Troubleshooting

### Issue: Tunnel URL changes every time
**Solution:** Make sure you're using a **named tunnel** (Part 1, Steps 2-3), not a quick tunnel.

### Issue: Build fails on Cloudflare
**Solution:** Check that all environment variables are set in the Cloudflare Pages dashboard.

### Issue: Database connection fails
**Solution:** Make sure your Neon database allows connections from Cloudflare's IP ranges (usually works by default).

---

## Benefits of This Setup

✅ **Permanent tunnel URL** - Never changes, works forever
✅ **Free hosting** - Cloudflare Pages is free for most use cases  
✅ **Global CDN** - Your app is fast worldwide
✅ **Automatic HTTPS** - SSL certificates included
✅ **Preview deployments** - Every PR gets its own URL
✅ **Unlimited bandwidth** - No traffic limits

---

## Cost Comparison

| Service | ngrok | Cloudflare |
|---------|-------|------------|
| Static tunnel | $8/mo | **FREE** |
| Hosting | N/A | **FREE** |
| Bandwidth | N/A | **FREE** |
| SSL | Included | **FREE** |

**Total:** $8/mo vs **$0/mo** 🎉
