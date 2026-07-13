import { chromium, Browser, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { randomDelay } from '@/lib/utils';

const prisma = new PrismaClient();

interface DMConfig {
  platforms: string[];
  checkIntervalMinutes: number;
  pdfLinks: Record<string, string>;
}

interface IncomingDM {
  platform: string;
  senderHandle: string;
  message: string;
  timestamp: Date;
}

const TRIGGER_KEYWORDS = [
  '1', 'start', 'interested', 'help', 'info', 'guide',
  '求带', '怎么弄', '怎么学', '有教程吗', '想学', '带带我',
  'how', 'what', 'details', 'more info', 'link', 'please'
];

const AUTO_REPLIES = {
  default: [
    "Hey! 👋 Thanks for reaching out. Here's the free guide you asked for: {link}\n\nLet me know if you have any questions!",
    "Hi there! 🙌 Here's the PDF guide: {link}\n\nIt covers everything you need to get started. DM me after you read it!",
    "Thanks for your interest! 📚 Here's your free resource: {link}\n\nLet me know which part interests you most!"
  ],
  chinese: [
    "你好！感谢关注 🙏 这是你要的免费资料：{link}\n\n看完告诉我你对哪个部分最感兴趣！",
    "收到！这是详细教程：{link}\n\n有任何问题随时问我 💪",
    "谢谢支持！资料在这里：{link}\n\n建议先看第一部分，很关键！"
  ]
};

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
        twitter: 'https://drive.google.com/default-pdf',
        instagram: 'https://drive.google.com/default-pdf',
        xiaohongshu: 'https://feishu.cn/default-pdf'
      },
      ...config
    };
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async startMonitoring(brandId: string): Promise<void> {
    console.log('👁️ Starting DM monitoring...');
    
    if (!this.browser) await this.initialize();
    
    this.isMonitoring = true;
    
    // Initial check
    await this.checkAllPlatforms(brandId);
    
    // Set up periodic checking
    this.intervalId = setInterval(() => {
      if (this.isMonitoring) {
        this.checkAllPlatforms(brandId);
      }
    }, this.config.checkIntervalMinutes * 60 * 1000);
    
    console.log(`✅ DM monitoring started (checking every ${this.config.checkIntervalMinutes} minutes)`);
  }

  private async checkAllPlatforms(brandId: string): Promise<void> {
    console.log('🔍 Checking DMs...');
    
    for (const platform of this.config.platforms) {
      try {
        const dms = await this.fetchNewDMs(platform, brandId);
        
        for (const dm of dms) {
          await this.processDM(dm, brandId);
        }
      } catch (error) {
        console.error(`❌ Error checking ${platform} DMs:`, error);
      }
    }
  }

  private async fetchNewDMs(platform: string, brandId: string): Promise<IncomingDM[]> {
    const dms: IncomingDM[] = [];
    
    if (!this.browser) return dms;
    
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    try {
      // Load session
      const session = await prisma.session.findUnique({
        where: {
          brandId_platform: { brandId, platform }
        }
      });
      
      if (session) {
        await context.addCookies(JSON.parse(session.cookieJson));
      }
      
      // Navigate to DMs
      const dmUrls: Record<string, string> = {
        twitter: 'https://twitter.com/messages',
        instagram: 'https://www.instagram.com/direct/inbox/',
        xiaohongshu: 'https://www.xiaohongshu.com/messages'
      };
      
      await page.goto(dmUrls[platform], { waitUntil: 'networkidle', timeout: 30000 });
      await randomDelay(2000, 4000);
      
      // Extract DMs based on platform
      const messages = await this.extractDMs(page, platform);
      dms.push(...messages);
      
      // Save updated session
      const cookies = await context.cookies();
      await prisma.session.upsert({
        where: {
          brandId_platform: { brandId, platform }
        },
        update: {
          cookieJson: JSON.stringify(cookies)
        },
        create: {
          brandId,
          platform,
          cookieJson: JSON.stringify(cookies),
          localStorage: '{}',
          userAgent: await page.evaluate(() => navigator.userAgent),
          viewport: JSON.stringify({ width: 1920, height: 1080 })
        }
      });
      
    } catch (error) {
      console.error(`Failed to fetch DMs from ${platform}:`, error);
    } finally {
      await page.close();
      await context.close();
    }
    
    return dms;
  }

  private async extractDMs(page: Page, platform: string): Promise<IncomingDM[]> {
    const dms: IncomingDM[] = [];
    
    try {
      if (platform === 'twitter') {
        // Extract Twitter DMs
        const conversations = await page.$$('[data-testid="conversation"]');
        
        for (const conv of conversations.slice(0, 10)) {
          const text = await conv.textContent() || '';
          const handle = text.match(/@(\w+)/)?.[1] || 'unknown';
          
          dms.push({
            platform,
            senderHandle: `@${handle}`,
            message: text.substring(0, 200),
            timestamp: new Date()
          });
        }
      } else if (platform === 'instagram') {
        // Extract Instagram DMs
        const messageItems = await page.$$('div[role="listitem"]');
        
        for (const item of messageItems.slice(0, 10)) {
          const text = await item.textContent() || '';
          dms.push({
            platform,
            senderHandle: 'unknown',
            message: text.substring(0, 200),
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('DM extraction failed:', error);
    }
    
    return dms;
  }

  private async processDM(dm: IncomingDM, brandId: string): Promise<void> {
    console.log(`📩 Processing DM from ${dm.senderHandle}: ${dm.message.substring(0, 50)}...`);
    
    // Check if this is a trigger message
    const isTrigger = this.isTriggerMessage(dm.message);
    
    if (!isTrigger) {
      console.log('  ℹ️ Not a trigger message, skipping');
      return;
    }
    
    // Check if already replied
    const existingDM = await prisma.dM.findFirst({
      where: {
        brandId,
        platform: dm.platform,
        userHandle: dm.senderHandle,
        status: { in: ['replied', 'followed_up', 'converted'] }
      }
    });
    
    if (existingDM) {
      console.log('  ℹ️ Already replied to this user');
      return;
    }
    
    // Save to database
    await prisma.dM.create({
      data: {
        brandId,
        platform: dm.platform,
        userHandle: dm.senderHandle,
        message: dm.message,
        status: 'received',
        triggerWord: this.findTriggerWord(dm.message)
      }
    });
    
    // Send auto-reply
    await this.sendAutoReply(dm, brandId);
  }

  private isTriggerMessage(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    
    return TRIGGER_KEYWORDS.some(keyword => 
      lowerMessage === keyword || 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  private findTriggerWord(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    for (const keyword of TRIGGER_KEYWORDS) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return keyword;
      }
    }
    
    return 'unknown';
  }

  private async sendAutoReply(dm: IncomingDM, brandId: string): Promise<void> {
    console.log(`  📤 Sending auto-reply to ${dm.senderHandle}...`);
    
    // Select reply template
    const isChinese = /[\u4e00-\u9fff]/.test(dm.message);
    const replies = isChinese ? AUTO_REPLIES.chinese : AUTO_REPLIES.default;
    const template = replies[Math.floor(Math.random() * replies.length)];
    
    // Get PDF link
    const pdfLink = this.config.pdfLinks[dm.platform] || this.config.pdfLinks.twitter;
    const replyText = template.replace('{link}', pdfLink);
    
    // Send reply via Playwright
    if (!this.browser) return;
    
    const context = await this.browser.newContext();
    const page = await context.newPage();
    
    try {
      // Load session
      const session = await prisma.session.findUnique({
        where: {
          brandId_platform: { brandId, platform: dm.platform }
        }
      });
      
      if (session) {
        await context.addCookies(JSON.parse(session.cookieJson));
      }
      
      // Navigate to conversation
      const dmUrls: Record<string, string> = {
        twitter: 'https://twitter.com/messages',
        instagram: 'https://www.instagram.com/direct/inbox/',
        xiaohongshu: 'https://www.xiaohongshu.com/messages'
      };
      
      await page.goto(dmUrls[dm.platform], { waitUntil: 'networkidle' });
      await randomDelay(2000, 4000);
      
      // Find and click conversation
      // This would need platform-specific selectors
      
      // Type and send reply
      await this.typeAndSend(page, dm.platform, replyText);
      
      // Update database
      await prisma.dM.updateMany({
        where: {
          brandId,
          platform: dm.platform,
          userHandle: dm.senderHandle,
          status: 'received'
        },
        data: {
          reply: replyText,
          status: 'replied',
          sentAt: new Date()
        }
      });
      
      console.log('  ✅ Reply sent');
      
      // Schedule follow-up
      this.scheduleFollowUp(dm, brandId, replyText);
      
    } catch (error) {
      console.error('  ❌ Failed to send reply:', error);
    } finally {
      await page.close();
      await context.close();
    }
  }

  private async typeAndSend(page: Page, platform: string, text: string): Promise<void> {
    // Platform-specific message input
    const inputSelectors: Record<string, string[]> = {
      twitter: ['div[role="textbox"]', '[data-testid="dmComposerTextInput"]'],
      instagram: ['textarea[placeholder*="Message"]', 'div[role="textbox"]'],
      xiaohongshu: ['textarea', 'input[type="text"]']
    };
    
    for (const selector of inputSelectors[platform] || []) {
      try {
        const input = await page.$(selector);
        if (input) {
          await input.click();
          await randomDelay(500, 1000);
          
          // Type with human-like delays
          for (const char of text) {
            await page.keyboard.type(char, { delay: Math.random() * 100 + 30 });
          }
          
          await randomDelay(500, 1500);
          await page.keyboard.press('Enter');
          return;
        }
      } catch (e) {
        continue;
      }
    }
  }

  private scheduleFollowUp(dm: IncomingDM, brandId: string, initialReply: string): void {
    // Schedule follow-up in 2 hours
    setTimeout(async () => {
      await this.sendFollowUp(dm, brandId);
    }, 2 * 60 * 60 * 1000);
  }

  private async sendFollowUp(dm: IncomingDM, brandId: string): Promise<void> {
    console.log(`  📨 Sending follow-up to ${dm.senderHandle}...`);
    
    const followUpMessages = [
      "Hey! Did you get a chance to check out the guide? Which part interests you most?",
      "Hi again! Just checking in - did you read the PDF? Any questions?",
      "Quick follow-up: The free pack is only available for limited time. Did you download it?"
    ];
    
    const chineseFollowUps = [
      "你好！资料看了吗？对哪个部分最感兴趣？",
      "跟进一下：免费资料限时提供，下载了吗？",
      "有什么问题可以随时问我 🙏"
    ];
    
    const isChinese = /[\u4e00-\u9fff]/.test(dm.message);
    const messages = isChinese ? chineseFollowUps : followUpMessages;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Send follow-up (similar to auto-reply)
    // ...
    
    // Update status
    await prisma.dM.updateMany({
      where: {
        brandId,
        platform: dm.platform,
        userHandle: dm.senderHandle
      },
      data: {
        status: 'followed_up'
      }
    });
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 DM monitoring stopped');
  }

  async close(): Promise<void> {
    this.stopMonitoring();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
let dmTriggerInstance: DMTrigger | null = null;

export function getDMTrigger(config?: Partial<DMConfig>): DMTrigger {
  if (!dmTriggerInstance) {
    dmTriggerInstance = new DMTrigger(config);
  }
  return dmTriggerInstance;
}

export async function startDMMonitoring(brandId: string): Promise<void> {
  const trigger = getDMTrigger();
  await trigger.initialize();
  await trigger.startMonitoring(brandId);
}
