# Lead Finder

AI-powered company research tool using Parallel.ai and OpenAI.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env` and fill in:
```bash
DATABASE_URL="your_neon_database_url"
PARALLEL_API_KEY="your_parallel_api_key"
OPENAI_API_KEY="your_openai_api_key"
WEBHOOK_SECRET="your_webhook_secret"
WEBHOOK_URL="will_be_set_by_tunnel"
```

### 3. Set Up Database
```bash
pnpm drizzle-kit push
```

### 4. Set Up Permanent Tunnel (FREE!)
```bash
./setup-cloudflare-tunnel.sh
```
This gives you a permanent, free webhook URL that never changes!

### 5. Start Development
```bash
# Terminal 1: Start tunnel
pnpm cf:tunnel

# Terminal 2: Start dev server
pnpm dev:simple
```

## 📚 Documentation

- **[Deploy to Cloudflare](./DEPLOY_TO_CLOUDFLARE.md)** - Production deployment + permanent tunnel setup
- **[Cloudflare Setup](./CLOUDFLARE_SETUP.md)** - Detailed tunnel configuration
- **[Plan](./plan.md)** - Development progress and architecture

## ✨ Features

- 🔍 Deep company research using Parallel.ai
- 🤖 AI-powered fit scoring and pitch generation (OpenAI GPT-5)
- 📊 Modern data grid with resizable columns
- 🗑️ Delete companies
- 📱 Responsive sidebar for detailed views
- 🔄 Real-time status updates
- 🔔 Webhook integration for async processing

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with React 19
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **AI:** OpenAI GPT-5 + Parallel.ai
- **UI:** TailwindCSS + TanStack Table
- **Hosting:** Cloudflare Pages (FREE!)
- **Tunneling:** Cloudflare Tunnel (FREE permanent URL!)

## 📦 Available Scripts

```bash
pnpm dev          # Start with ngrok (legacy)
pnpm dev:simple   # Start Next.js dev server only
pnpm cf:tunnel    # Start Cloudflare tunnel
pnpm build        # Build for production
pnpm build:cf     # Build for Cloudflare Pages
pnpm deploy       # Deploy to Cloudflare Pages
pnpm preview      # Preview production build locally
```

## 🌐 Deployment

Deploy to Cloudflare Pages for free:
1. Follow [DEPLOY_TO_CLOUDFLARE.md](./DEPLOY_TO_CLOUDFLARE.md)
2. Connect your GitHub repo
3. Add environment variables
4. Deploy!

Your app will be live at `https://lead-finder-xxx.pages.dev`

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `PARALLEL_API_KEY` | Parallel.ai API key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `WEBHOOK_SECRET` | Parallel.ai webhook secret | ✅ |
| `WEBHOOK_URL` | Your webhook URL (set by tunnel) | ✅ |

## 📊 How It Works

1. **Submit URL:** Enter a company URL via the form
2. **Research:** Parallel.ai analyzes the company (30s-2min)
3. **AI Analysis:** OpenAI GPT-5 generates fit score & pitch
4. **View Results:** See all data in the interactive datagrid
5. **Explore:** Click any cell to view full content in sidebar

## 🆘 Support

- **Issues:** Open a GitHub issue
- **Docs:** Check `DEPLOY_TO_CLOUDFLARE.md` for deployment help
- **Tunnel:** See `CLOUDFLARE_SETUP.md` for tunnel configuration

## 📄 License

MIT
# enrich-leads
