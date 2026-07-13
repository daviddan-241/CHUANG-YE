import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { randomDelay } from '@/lib/utils';

const prisma = new PrismaClient();

interface BurnerAccount {
  id: string;
  platform: string;
  username: string;
  password: string;
  sessionData?: string | null;
}

interface EngagementAction {
  type: 'like' | 'comment' | 'save' | 'follow' | 'view';
  postId?: string;
  commentText?: string;
}

const CHINESE_COMMENTS = [
  '求带 🙏',
  '干货！收藏了',
  '已私信',
  '太实用了！',
  '感谢分享 ❤️',
  '新手求指导',
  '这波必须关注',
  '终于找到组织了',
  '大佬带带我',
  '已关注，期待更新',
  '说得太对了',
  '学到很多',
  '马上去试试',
  '这个必须赞',
  '太强了！',
  '请问怎么入行？',
  '有没有详细教程？',
  '已下单支持',
  '比心 ❤️',
  '学到了学到了'
];

const ENGLISH_COMMENTS = [
  'This is gold! 🔥',
  'Following for more',
  'DM sent!',
  'Great content as always',
  'How do I get started?',
  'This changed my life',
  'Bookmarked! 📌',
  'Need more of this',
  'You\'re the GOAT',
  'Started implementing this today',
  'Thanks for sharing!',
  'Just what I needed',
  'Can you make a tutorial?',
  'Link in bio?',
  'Worth the follow'
];

export class FakeEngagement {
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
  }

  async engageWithPost(
    mainAccountUsername: string,
    postUrl: string,
    platform: string,
    burnerAccounts: BurnerAccount[]
  ): Promise<void> {
    console.log(`🎯 Starting fake engagement for post: ${postUrl}`);
    
    if (!this.browser) await this.initialize();

    for (const burner of burnerAccounts) {
      try {
        console.log(`  👤 Using burner: ${burner.username}`);
        
        // Get or create context for this burner
        const context = await this.getOrCreateContext(burner, platform);
        const page = await context.newPage();
        
        // Random delay before starting (30-90 seconds)
        const initialDelay = Math.floor(Math.random() * 60000) + 30000;
        console.log(`  ⏳ Waiting ${Math.floor(initialDelay / 1000)}s before engagement...`);
        await this.delay(initialDelay);

        // Navigate to post
        await page.goto(postUrl, { waitUntil: 'networkidle', timeout: 30000 });
        await randomDelay(2000, 5000);

        // Perform engagement actions
        await this.performEngagementSequence(page, platform, burner, mainAccountUsername);
        
        // Save session
        const cookies = await context.cookies();
        await this.saveSession(burner, platform, cookies);
        
        await page.close();
        
        // Random delay between burners
        await randomDelay(10000, 30000);
        
      } catch (error) {
        console.error(`  ❌ Error with burner ${burner.username}:`, error);
      }
    }

    console.log('✅ Fake engagement complete');
  }

  private async performEngagementSequence(
    page: Page,
    platform: string,
    burner: BurnerAccount,
    mainUsername: string
  ): Promise<void> {
    const actions: EngagementAction[] = [
      { type: 'view' },
      { type: 'like' },
      { type: 'save' },
      { type: 'comment' },
      { type: 'follow' }
    ];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'view':
            await this.viewPost(page, platform);
            break;
          case 'like':
            await this.likePost(page, platform);
            break;
          case 'save':
            await this.savePost(page, platform);
            break;
          case 'comment':
            await this.commentOnPost(page, platform);
            break;
          case 'follow':
            await this.followUser(page, platform, mainUsername);
            break;
        }
        
        // Human-like delay between actions
        await randomDelay(2000, 8000);
      } catch (error) {
        console.error(`    ❌ Action ${action.type} failed:`, error);
      }
    }

    // View 3 more posts from profile
    await this.browseProfile(page, platform, mainUsername);
  }

  private async viewPost(page: Page, platform: string): Promise<void> {
    console.log('    👁️ Viewing post...');
    
    // Scroll to view full post
    await page.mouse.wheel(0, 300);
    await randomDelay(1000, 3000);
    await page.mouse.wheel(0, -100);
    await randomDelay(500, 1500);
  }

  private async likePost(page: Page, platform: string): Promise<void> {
    console.log('    ❤️ Liking post...');
    
    const likeSelectors: Record<string, string[]> = {
      twitter: ['[data-testid="like"]', 'button[aria-label*="Like"]'],
      instagram: ['article button svg[aria-label="Like"]', 'button[type="button"] span[class*="like"]'],
      xiaohongshu: ['.like-wrapper', '.note-detail-like'],
      facebook: ['[aria-label="Like"]', 'button[data-testid="fb-ufi-likelink"]']
    };

    for (const selector of likeSelectors[platform] || []) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log('    ✅ Post liked');
          return;
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async savePost(page: Page, platform: string): Promise<void> {
    console.log('    💾 Saving post...');
    
    const saveSelectors: Record<string, string[]> = {
      twitter: ['[data-testid="bookmark"]', 'button[aria-label*="Bookmark"]'],
      instagram: ['button[aria-label="Save"]', 'svg[aria-label="Save"]'],
      xiaohongshu: ['.collect-wrapper', '.note-detail-collect']
    };

    for (const selector of saveSelectors[platform] || []) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          console.log('    ✅ Post saved');
          return;
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async commentOnPost(page: Page, platform: string): Promise<void> {
    console.log('    💬 Commenting...');
    
    const isChinese = Math.random() > 0.5;
    const comments = isChinese ? CHINESE_COMMENTS : ENGLISH_COMMENTS;
    const comment = comments[Math.floor(Math.random() * comments.length)];

    const commentSelectors: Record<string, string[]> = {
      twitter: ['[data-testid="tweetTextarea_0"]', 'div[role="textbox"]'],
      instagram: ['textarea[placeholder*="comment"]', 'form textarea'],
      xiaohongshu: ['.comment-input', 'textarea[placeholder*="评论"]']
    };

    for (const selector of commentSelectors[platform] || []) {
      try {
        const input = await page.$(selector);
        if (input) {
          await input.click();
          await randomDelay(500, 1000);
          
          // Type with human-like delays
          for (const char of comment) {
            await page.keyboard.type(char, { delay: Math.random() * 150 + 50 });
            if (Math.random() > 0.9) {
              await randomDelay(200, 500);
            }
          }
          
          await randomDelay(500, 1500);
          
          // Submit comment
          await page.keyboard.press('Enter');
          console.log(`    ✅ Commented: ${comment}`);
          return;
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async followUser(page: Page, platform: string, username: string): Promise<void> {
    console.log(`    👥 Following ${username}...`);
    
    const followSelectors: Record<string, string[]> = {
      twitter: ['button[data-testid$="-follow"]', 'button[aria-label*="Follow"]'],
      instagram: ['button:has-text("Follow")', 'button[type="button"]:has-text("Follow")'],
      xiaohongshu: ['.follow-button', 'button:has-text("关注")']
    };

    for (const selector of followSelectors[platform] || []) {
      try {
        const button = await page.$(selector);
        if (button) {
          const text = await button.textContent();
          if (text && !text.toLowerCase().includes('following')) {
            await button.click();
            console.log('    ✅ Followed');
            return;
          }
        }
      } catch (e) {
        continue;
      }
    }
  }

  private async browseProfile(page: Page, platform: string, username: string): Promise<void> {
    console.log('    📱 Browsing profile...');
    
    try {
      // Navigate to profile
      const profileUrls: Record<string, string> = {
        twitter: `https://twitter.com/${username}`,
        instagram: `https://www.instagram.com/${username}/`,
        xiaohongshu: `https://www.xiaohongshu.com/user/${username}`
      };

      await page.goto(profileUrls[platform] || profileUrls.twitter, {
        waitUntil: 'networkidle',
        timeout: 20000
      });
      
      await randomDelay(2000, 4000);

      // View 3 posts
      for (let i = 0; i < 3; i++) {
        await page.mouse.wheel(0, 500);
        await randomDelay(1500, 3000);
      }
    } catch (error) {
      console.error('    ❌ Profile browsing failed:', error);
    }
  }

  private async getOrCreateContext(burner: BurnerAccount, platform: string): Promise<BrowserContext> {
    const key = `${burner.id}_${platform}`;
    
    if (this.contexts.has(key)) {
      return this.contexts.get(key)!;
    }

    // Create new context with random fingerprint
    const context = await this.browser!.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US'
    });

    // Load session if exists
    if (burner.sessionData) {
      try {
        const cookies = JSON.parse(burner.sessionData);
        await context.addCookies(cookies);
      } catch (e) {
        console.log('    Could not load session, starting fresh');
      }
    }

    this.contexts.set(key, context);
    return context;
  }

  private async saveSession(burner: BurnerAccount, platform: string, cookies: any[]): Promise<void> {
    try {
      await prisma.burnerAccount.update({
        where: { id: burner.id },
        data: {
          sessionData: JSON.stringify(cookies),
          lastUsed: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36'
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    for (const context of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

// Singleton instance
let fakeEngagementInstance: FakeEngagement | null = null;

export function getFakeEngagement(): FakeEngagement {
  if (!fakeEngagementInstance) {
    fakeEngagementInstance = new FakeEngagement();
  }
  return fakeEngagementInstance;
}

export async function triggerEngagement(
  mainUsername: string,
  postUrl: string,
  platform: string
): Promise<void> {
  const engagement = getFakeEngagement();
  
  // Get active burner accounts
  const burners = await prisma.burnerAccount.findMany({
    where: {
      platform,
      isActive: true
    }
  });

  if (burners.length === 0) {
    console.log('⚠️ No burner accounts available');
    return;
  }

  await engagement.engageWithPost(mainUsername, postUrl, platform, burners);
}
