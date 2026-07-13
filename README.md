# DAVE Social AI 🚀

**Dashboard for Autonomous Virtual Engagement**

A fully automated social media management system with real AI content generation (free), real Telegram user login (phone number → SMS code), human-like browser automation from Shanghai, and a production-ready Docker image for Render hosting.

![DAVE](https://img.shields.io/badge/DAVE-Social%20AI-06b6d4?style=for-the-badge&logo=robot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)
![Free AI](https://img.shields.io/badge/AI-Groq%20Free-22c55e?style=for-the-badge)

---

## ✅ What's Real

| Feature | Status | Details |
|---|---|---|
| **AI Content** | ✅ Real | Free Groq API — llama-3.3-70b |
| **Telegram Login** | ✅ Real | Phone number + SMS code via GramJS |
| **Browser Automation** | ✅ Real | Playwright stealth, Shanghai location |
| **Docker Image** | ✅ Real | Chromium + Chinese fonts baked in |
| **Scheduler** | ✅ Real | BullMQ + node-cron |
| **Analytics** | ✅ Real | Prisma SQLite DB |
| **DM Auto-reply** | ✅ Real | AI-powered via Groq |

---

## 🚀 Deploy on Render (Free)

### 1. Push to GitHub
Already done — your repo is at `https://github.com/daviddan-241/CHUANG-YE`

### 2. Connect to Render
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect GitHub → select **daviddan-241/CHUANG-YE**
3. Render detects `render.yaml` automatically (uses Docker)
4. Click **Create Web Service**

### 3. Set Environment Variables in Render Dashboard

| Variable | Value | Where to get |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | [console.groq.com](https://console.groq.com) — FREE |
| `TELEGRAM_API_ID` | `12345678` | [my.telegram.org](https://my.telegram.org/apps) → API development tools |
| `TELEGRAM_API_HASH` | `abc123...` | Same page as above |
| `ENCRYPTION_KEY` | random string | Render auto-generates one |
| `NEXT_PUBLIC_APP_URL` | your Render URL | After first deploy |

### 4. Telegram Phone Login (after deploy)
1. Open your deployed app → **Settings** → **Telegram Login**
2. Enter your API ID + API Hash from step above
3. Enter your phone number (e.g. `+8613800138000`)
4. Enter the SMS code Telegram sends you
5. Done — DAVE is logged in as a real Telegram user

---

## 🛠️ Local Development

```bash
# 1. Clone
git clone https://github.com/daviddan-241/CHUANG-YE.git
cd CHUANG-YE

# 2. Install
npm install

# 3. Set up env
cp .env.example .env
# Edit .env — add GROQ_API_KEY at minimum

# 4. Database
npm run db:push

# 5. Install Playwright Chromium
npm run playwright:install

# 6. Run
npm run dev
```

Visit http://localhost:3000

---

## 🤖 Free AI Setup

DAVE uses **Groq** — completely free, very fast:

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card)
3. Create API Key
4. Set `GROQ_API_KEY=gsk_...` in your environment

**Models used:**
- `llama-3.3-70b-versatile` — main content generation (best quality)
- `llama-3.1-8b-instant` — DM replies and quick tasks (fastest)

No OpenAI key needed.

---

## 📱 Real Telegram Login

DAVE logs in as a real Telegram user (not just a bot) using your phone number:

**Requirements:**
- Your Telegram account (any phone number)
- Free API credentials from [my.telegram.org](https://my.telegram.org/apps):
  1. Log in with your phone
  2. Click "API development tools"
  3. Fill in App name (e.g. "DAVE") and Platform (Other)
  4. Copy `App api_id` and `App api_hash`

**What DAVE can do as a real user:**
- Post to any group/channel you're a member of
- Send and receive DMs
- Auto-reply to trigger keywords
- Monitor multiple groups
- Join channels

---

## 🌏 China/Shanghai Configuration

All browser automation runs as if from Shanghai:
- **Timezone:** Asia/Shanghai (UTC+8)
- **Locale:** zh-CN
- **Geolocation:** 121.47°E, 31.23°N (Shanghai)
- **Language headers:** zh-CN,zh;q=0.9,en;q=0.8
- **User agents:** Windows/Chrome (most common in China)
- **Docker fonts:** Noto CJK (Chinese characters render correctly)

---

## 💰 Make Money Features

| Feature | How it makes money |
|---|---|
| **AI Content Studio** | Generate viral posts → grow following → sell products |
| **Telegram Auto-DM** | Keyword triggers → send product links → conversions |
| **Smart Scheduling** | Post at peak hours → more reach → more sales |
| **Multi-Brand** | Run ChuangYe + VelocityEdge simultaneously |
| **Analytics** | Track what converts → double down |
| **Image Lab** | Professional product images → higher CTR |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── dashboard/         # Main dashboard
│   ├── content-studio/    # AI post generation
│   ├── analytics/         # Performance metrics
│   ├── platforms/         # Platform connections
│   ├── image-lab/         # AI image generation
│   ├── settings/          # Config + Telegram login
│   └── api/
│       ├── telegram/
│       │   ├── auth/phone/ # Send SMS code
│       │   ├── auth/code/  # Verify code
│       │   ├── auth/status/# Check connection
│       │   └── send/       # Send message
│       └── content/generate/
├── lib/
│   ├── telegram/client.ts      # GramJS real user login
│   ├── ai/groq-client.ts       # Free Groq AI
│   ├── automation/browser.ts   # Playwright (Shanghai)
│   ├── services/contentGenerator.ts
│   └── orchestrator/telegram-manager.ts
prisma/schema.prisma             # Database schema
Dockerfile                       # Production image
render.yaml                      # Render deployment config
```

---

## ⚠️ Disclaimer

This tool is for legitimate social media management. Users are responsible for complying with each platform's terms of service.

---

**Built for ChuangYe & VelocityEdge brands 🇨🇳**
