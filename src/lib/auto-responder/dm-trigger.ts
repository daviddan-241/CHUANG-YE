/**
 * DM Trigger — monitors DMs across platforms and auto-replies
 * AI replies powered by free Groq (llama-3.3-70b)
 * Browser automation uses Shanghai/zh-CN locale
 */
import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { generateDMReply } from '@/lib/ai/groq-client';

const prisma = new PrismaClient();

interface DMConfig {
  platforms: string[];
  checkIntervalMinutes: number;
  pdfLinks: Record<string, string>;
  brandPersona: string;
}

const TRIGGER_KEYWORDS = [
  '1', 'start', 'interested', 'help', 'info', 'guide', 'how', 'link', 'please', 'details',
  '求带', '怎么弄', '怎么学', '有教程吗', '想学', '带带我', '资料', '详情', '开始', '了解',
];

export class DMTrigger {
  private browser: Browser | null = null;
  private isMonitoring: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private config: DMConfig;

  constructor(config: Partial<DMConfig> = {}) {
    this.config = {
      platforms: ['twitter', 'instagram', 'xiaohongshu'],
      checkIntervalMinutes: 5,
      pdfLinks: {
        twitter: process.env.PDF_LINK_TWITTER || 'https://t.me/chuangye_official',
        instagram: process.env.PDF_LINK_INSTAGRAM || 'https://t.me/chuangye_official',
        xiaohongshu: process.env.PDF_LINK_XHS || 'https://t.me/chuangye_official',
      },
      brandPersona: process.env.BRAND_A_NAME || 'ChuangYe',
      ...config,
    };
  }

  async initialize(): Promise<void> {
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;
    this.browser = await chromium.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox', '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', '--lang=zh-CN',
      ],
    });
  }

  async startMonitoring(brandId: string): Promise<void> {
    console.log('👁️ Starting DM monitoring...');
    if (!this.browser) await this.initialize();

    this.isMonitoring = true;
    await this.checkAllPlatforms(brandId);

    this.intervalId = setInterval(() => {
      if (this.isMonitoring) {
        this.checkAllPlatforms(brandId).catch(console.error);
      }
    }, this.config.checkIntervalMinutes * 60 * 1000);
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏹️ DM monitoring stopped');
  }

  private async checkAllPlatforms(brandId: string): Promise<void> {
    for (const platform of this.config.platforms) {
      try {
        const dms = await this.fetchDMs(platform, brandId);
        for (const dm of dms) {
          await this.processDM(dm, brandId);
        }
      } catch (err) {
        console.error(`Error checking ${platform} DMs:`, err);
      }
    }
  }

  private async fetchDMs(
    platform: string,
    brandId: string
  ): Promise<Array<{ senderHandle: string; message: string; timestamp: Date }>> {
    // In production, this integrates with the browser automation
    // to scrape the platform's DM inbox
    // Returns unread DMs that haven't been processed yet
    const existing = await prisma.dM.findMany({
      where: { brandId, platform, status: 'received' },
      take: 20,
    });
    return existing.map((d) => ({
      senderHandle: d.userHandle,
      message: d.message,
      timestamp: d.createdAt,
    }));
  }

  private async processDM(
    dm: { senderHandle: string; message: string; timestamp: Date },
    brandId: string
  ): Promise<void> {
    const lower = dm.message.toLowerCase();
    const triggered = TRIGGER_KEYWORDS.some((kw) => lower.includes(kw));
    if (!triggered) return;

    const hasChinese = /[\u4E00-\u9FFF]/.test(dm.message);
    const productLink =
      this.config.pdfLinks[dm.senderHandle] || this.config.pdfLinks.twitter;

    try {
      const reply = await generateDMReply({
        incomingMessage: dm.message,
        brandPersona: this.config.brandPersona,
        productLink,
        language: hasChinese ? 'zh' : 'en',
      });

      console.log(`💬 Auto-replying to @${dm.senderHandle}: ${reply.substring(0, 60)}...`);

      // Mark replied in DB
      await prisma.dM.updateMany({
        where: { userHandle: dm.senderHandle, status: 'received' },
        data: { reply, status: 'replied', sentAt: new Date() },
      });
    } catch (err) {
      console.error('DM reply generation failed:', err);
    }
  }

  async recordIncomingDM(
    brandId: string,
    platform: string,
    userHandle: string,
    message: string
  ): Promise<void> {
    await prisma.dM.create({
      data: { brandId, platform, userHandle, message, status: 'received' },
    });
  }

  async close(): Promise<void> {
    this.stopMonitoring();
    await this.browser?.close();
    this.browser = null;
  }
}

let dmTriggerInstance: DMTrigger | null = null;

export function getDMTrigger(config?: Partial<DMConfig>): DMTrigger {
  if (!dmTriggerInstance) {
    dmTriggerInstance = new DMTrigger(config);
  }
  return dmTriggerInstance;
}
