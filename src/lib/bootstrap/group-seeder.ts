import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { randomDelay } from '@/lib/utils';

const prisma = new PrismaClient();

interface GroupSeedConfig {
  platform: 'telegram' | 'wechat';
  groupUrl: string;
  groupName: string;
  messagesPerBurner: number;
  intervalHours: number;
}

const GROUP_MESSAGES = {
  telegram: [
    '刚加入，求带 🙏',
    '这个群太有价值了！',
    '终于找到组织了',
    '大家好，新人报道',
    '期待学习交流',
    '感谢群主分享',
    '干货满满！',
    '已关注，期待更多内容',
    '请问有入门资料吗？',
    '太棒了！',
    'Good group! 👍',
    'Thanks for adding me!',
    'Looking forward to learning',
    'Great community!',
    'Just joined, excited to be here'
  ],
  wechat: [
    '刚加入，求带 🙏',
    '这个群太有价值了！',
    '终于找到组织了',
    '大家好，新人报道',
    '期待学习交流',
    '感谢群主分享',
    '干货满满！',
    '已关注，期待更多内容',
    '请问有入门资料吗？',
    '太棒了！'
  ]
};

const REACTIONS = ['👍', '❤️', '🔥', '💯', '🎉', '👏'];

export class GroupSeeder {
  private browser: Browser | null = null;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async seedGroup(config: GroupSeedConfig): Promise<void> {
    console.log(`🌱 Starting group seeding for: ${config.groupName}`);
    
    if (!this.browser) await this.initialize();

    // Get burner accounts for this platform
    const burners = await prisma.burnerAccount.findMany({
      where: {
        platform: config.platform,
        isActive: true
      }
    });

    if (burners.length === 0) {
      console.log('⚠️ No burner accounts available for seeding');
      return;
    }

    // Add burners to group if not already members
    await this.addBurnersToGroup(config, burners.slice(0, 15));

    // Start periodic messaging
    this.startPeriodicMessaging(config, burners);

    console.log(`✅ Group seeding started for ${config.groupName}`);
  }

  private async addBurnersToGroup(config: GroupSeedConfig, burners: any[]): Promise<void> {
    console.log(`  👥 Adding ${burners.length} burners to group...`);

    for (const burner of burners) {
      try {
        const context = await this.browser!.newContext({
          userAgent: this.getRandomUserAgent()
        });
        const page = await context.newPage();

        if (config.platform === 'telegram') {
          await this.joinTelegramGroup(page, config.groupUrl, burner);
        } else if (config.platform === 'wechat') {
          // WeChat group joining requires QR code scanning
          console.log('  ℹ️ WeChat group joining requires manual QR scanning');
        }

        await page.close();
        await context.close();

        // Delay between joins
        await randomDelay(30000, 60000);
      } catch (error) {
        console.error(`  ❌ Failed to add ${burner.username}:`, error);
      }
    }
  }

  private async joinTelegramGroup(page: Page, groupUrl: string, burner: any): Promise<void> {
    try {
      // Load session if exists
      if (burner.sessionData) {
        // Set cookies from session
      }

      // Navigate to Telegram Web
      await page.goto('https://web.telegram.org/', { waitUntil: 'networkidle' });
      await randomDelay(2000, 4000);

      // Navigate to group
      await page.goto(groupUrl, { waitUntil: 'networkidle' });
      await randomDelay(2000, 4000);

      // Click join button if present
      const joinButton = await page.$('button:has-text("Join")');
      if (joinButton) {
        await joinButton.click();
        console.log(`    ✅ ${burner.username} joined group`);
        await randomDelay(2000, 4000);
      }

      // Save session
      const cookies = await page.context().cookies();
      await prisma.burnerAccount.update({
        where: { id: burner.id },
        data: {
          sessionData: JSON.stringify(cookies),
          lastUsed: new Date()
        }
      });
    } catch (error) {
      console.error(`    ❌ Telegram join failed:`, error);
    }
  }

  private startPeriodicMessaging(config: GroupSeedConfig, burners: any[]): void {
    // Clear existing interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.isRunning = true;

    // Send initial messages
    this.sendGroupMessages(config, burners);

    // Set up periodic messaging
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.sendGroupMessages(config, burners);
      }
    }, config.intervalHours * 60 * 60 * 1000);
  }

  private async sendGroupMessages(config: GroupSeedConfig, burners: any[]): Promise<void> {
    console.log(`  💬 Sending group messages to ${config.groupName}...`);

    // Select random burners to send messages (2-4 per cycle)
    const messageCount = Math.floor(Math.random() * 3) + 2;
    const selectedBurners = this.shuffleArray(burners).slice(0, messageCount);

    for (const burner of selectedBurners) {
      try {
        const messages = GROUP_MESSAGES[config.platform];
        const message = messages[Math.floor(Math.random() * messages.length)];

        await this.sendMessage(config, burner, message);
        
        // Random delay between messages
        await randomDelay(60000, 180000); // 1-3 minutes
      } catch (error) {
        console.error(`    ❌ Message failed for ${burner.username}:`, error);
      }
    }

    // Also react to recent messages
    await this.reactToMessages(config, burners.slice(0, 3));
  }

  private async sendMessage(config: GroupSeedConfig, burner: any, message: string): Promise<void> {
    if (!this.browser) return;

    const context = await this.browser.newContext();
    const page = await context.newPage();

    try {
      if (config.platform === 'telegram') {
        await page.goto('https://web.telegram.org/', { waitUntil: 'networkidle' });
        await randomDelay(2000, 4000);

        // Navigate to group chat
        // This would need proper selectors based on Telegram Web UI
        // For now, we'll log the action
        console.log(`    📩 ${burner.username}: ${message}`);
      }

      // Update last used
      await prisma.burnerAccount.update({
        where: { id: burner.id },
        data: { lastUsed: new Date() }
      });
    } catch (error) {
      console.error('Message sending failed:', error);
    } finally {
      await page.close();
      await context.close();
    }
  }

  private async reactToMessages(config: GroupSeedConfig, burners: any[]): Promise<void> {
    console.log('  👍 Adding reactions...');

    for (const burner of burners) {
      const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
      console.log(`    ${burner.username}: ${reaction}`);
      
      // In a real implementation, this would navigate to the group
      // and click the reaction button on recent messages
      
      await randomDelay(5000, 15000);
    }
  }

  stopSeeding(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🛑 Group seeding stopped');
  }

  private shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  async close(): Promise<void> {
    this.stopSeeding();
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
let groupSeederInstance: GroupSeeder | null = null;

export function getGroupSeeder(): GroupSeeder {
  if (!groupSeederInstance) {
    groupSeederInstance = new GroupSeeder();
  }
  return groupSeederInstance;
}

export async function startGroupSeeding(config: GroupSeedConfig): Promise<void> {
  const seeder = getGroupSeeder();
  await seeder.initialize();
  await seeder.seedGroup(config);
}
