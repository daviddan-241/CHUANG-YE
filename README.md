# DAVE Social AI

**Dashboard for Autonomous Virtual Engagement**

A fully automated social media management system with AI-powered content generation, human-like browser automation, and multi-platform support.

![DAVE Social AI](https://img.shields.io/badge/DAVE-Social%20AI-06b6d4?style=for-the-badge&logo=robot&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.61-green?style=for-the-badge&logo=playwright&logoColor=white)

## 🚀 Features

### Core Capabilities

- **Multi-Platform Support**: Twitter/X, Telegram, Instagram, Facebook, Xiaohongshu (RED), WeChat, Douyin
- **AI Content Generation**: Generate engaging posts tailored to each platform
- **Image Generation**: Create consistent, professional images using ComfyUI/Stable Diffusion XL
- **Browser Automation**: Human-like behavior with Playwright (stealth mode, random delays, natural mouse movements)
- **Smart Scheduling**: Optimal posting times based on analytics
- **Auto-Engagement**: Like, comment, follow, and boost engagement automatically
- **Style Learning**: Learn from your existing posts to match your writing style
- **Multi-Brand Support**: Run two personas/brands simultaneously

### Dashboard Features

- 📊 Real-time analytics and engagement metrics
- 📅 Calendar-based content scheduler
- 🎨 AI image lab with reference photo support
- 🧠 Memory system for learned preferences
- 📝 Detailed activity logs
- ⚙️ Comprehensive settings

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Playwright browsers (will be installed automatically)
- Optional: ComfyUI or Stable Diffusion WebUI for image generation
- Optional: Redis for BullMQ job queue

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/dave-social-ai.git
cd dave-social-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Image Generation API (optional)
COMFYUI_API_URL="http://localhost:8188"
SD_API_URL="http://localhost:7860"

# Redis (optional, for BullMQ)
REDIS_URL="redis://localhost:6379"

# Encryption Key (for session storage)
ENCRYPTION_KEY="your-secure-encryption-key-here"

# API Keys (optional)
OPENAI_API_KEY="your-openai-api-key"
```

### 4. Set up the database

```bash
npm run db:generate
npm run db:push
```

### 5. Install Playwright browsers

```bash
npx playwright install chromium
```

### 6. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

## 🎯 Usage

### Quick Start

1. **Connect Platforms**: Navigate to the Platforms page and connect your social media accounts
2. **Generate Content**: Use the Content Studio to create AI-powered posts
3. **Schedule Posts**: Set up automated posting schedules
4. **Monitor Engagement**: Track performance in the Analytics dashboard

### Using the DAVE Assistant

The built-in DAVE Assistant can help you:
- Generate posts on any topic
- Create images for your content
- Schedule posts
- Analyze engagement metrics
- Manage your accounts

Simply type your request in the assistant panel!

### Browser Automation

DAVE uses Playwright for browser automation with these features:
- **Stealth Mode**: Bypasses bot detection
- **Human-like Behavior**: Random delays, natural mouse movements, realistic typing
- **Session Persistence**: Saves and restores login sessions
- **Visible Mode**: Watch automation in real-time (toggle in settings)

### Image Generation

DAVE supports multiple image generation backends:

1. **ComfyUI** (recommended): Full-featured, local generation
2. **Stable Diffusion WebUI**: Alternative local option
3. **Placeholder**: Fallback for testing

To set up ComfyUI:
1. Install [ComfyUI](https://github.com/comfyanonymous/ComfyUI)
2. Download SDXL models
3. Start ComfyUI with API enabled
4. Set `COMFYUI_API_URL` in your `.env` file

## 📁 Project Structure

```
dave-social-ai/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── content/           # Content generation
│   │   │   ├── images/            # Image generation
│   │   │   └── scheduler/         # Job scheduling
│   │   ├── dashboard/             # Dashboard page
│   │   ├── platforms/             # Platform management
│   │   ├── content-studio/        # Content creation
│   │   ├── image-lab/             # Image generation
│   │   ├── scheduler/             # Post scheduling
│   │   ├── analytics/             # Engagement analytics
│   │   ├── memory/                # Style & preferences
│   │   ├── settings/              # Configuration
│   │   └── logs/                  # Activity logs
│   ├── components/
│   │   ├── layout/                # Layout components
│   │   ├── dashboard/             # Dashboard widgets
│   │   └── ui/                    # Reusable UI components
│   ├── lib/
│   │   ├── automation/            # Browser automation
│   │   │   ├── browser.ts         # Playwright wrapper
│   │   │   ├── twitter.ts         # Twitter automation
│   │   │   └── ...                # Other platforms
│   │   ├── services/              # Core services
│   │   │   ├── contentGenerator.ts
│   │   │   ├── imageGenerator.ts
│   │   │   └── scheduler.ts
│   │   └── utils.ts               # Utility functions
│   ├── stores/                    # Zustand state management
│   └── types/                     # TypeScript types
├── prisma/
│   └── schema.prisma              # Database schema
├── public/
│   ├── images/                    # Generated images
│   └── sessions/                  # Browser sessions
└── docker/                        # Docker configuration
```

## 🔧 Configuration

### Platform Settings

Each platform can be configured with:
- **Fingerprint**: Browser fingerprint to use
- **Proxy**: Optional proxy settings
- **Posting Limits**: Maximum posts per day
- **Engagement Rules**: Auto-like, auto-follow settings

### Automation Settings

- **Auto-Post**: Enable/disable automatic posting
- **Auto-Reply**: Respond to mentions and DMs
- **Engagement Boost**: Automatically engage with relevant content
- **Posting Frequency**: How often to post
- **Daily Limits**: Maximum actions per day

## 🐳 Docker Deployment

### Build the Docker image

```bash
docker build -t dave-social-ai .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Deploy to Render.com

1. Fork this repository
2. Connect to Render.com
3. Create a new Web Service
4. Use the provided `render.yaml` configuration

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Configure environment variables
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Playwright](https://playwright.dev/) - Browser automation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations

## ⚠️ Disclaimer

This tool is for educational and legitimate social media management purposes only. Users are responsible for complying with each platform's terms of service. The developers are not responsible for any misuse of this software.

## 📧 Support

For support, please open an issue on GitHub or contact us at support@davesocialai.com

---

**Built with ❤️ by the DAVE Team**
