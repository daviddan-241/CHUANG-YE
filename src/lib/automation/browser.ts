import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { randomDelay } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export interface BrowserConfig {
  headless?: boolean;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface SessionData {
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
}

const DEFAULT_CONFIG: BrowserConfig = {
  headless: false,
  viewport: {
    width: 1920,
    height: 1080
  }
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

export class BrowserAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;
  private sessionDir: string;

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionDir = path.join(process.cwd(), 'public', 'sessions');
    
    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    try {
      // Launch browser with stealth settings
      this.browser = await chromium.launch({
        headless: this.config.headless,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-web-security',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ]
      });

      // Create context with random user agent
      const userAgent = this.config.userAgent || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      
      this.context = await this.browser.newContext({
        userAgent,
        viewport: this.config.viewport,
        locale: 'en-US',
        timezoneId: 'America/New_York',
        geolocation: { longitude: -73.935242, latitude: 40.730610 },
        permissions: ['geolocation'],
        ignoreHTTPSErrors: true,
      });

      // Apply stealth patches
      await this.applyStealthPatches();

      // Create new page
      this.page = await this.context.newPage();

      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  private async applyStealthPatches(): Promise<void> {
    if (!this.context) return;

    await this.context.addInitScript(() => {
      // Override webdriver detection
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override chrome detection
      (window as any).chrome = {
        runtime: {},
        loadTimes: function() {},
        csi: function() {},
        app: {},
      };

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission } as PermissionStatus) :
          originalQuery(parameters)
      );

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
  }

  async loadSession(platform: string, username: string): Promise<boolean> {
    const sessionPath = this.getSessionPath(platform, username);
    
    if (!fs.existsSync(sessionPath)) {
      console.log(`No session found for ${platform}/${username}`);
      return false;
    }

    try {
      const sessionData: SessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
      
      if (this.context) {
        // Add cookies
        await this.context.addCookies(sessionData.cookies);
        
        // Set localStorage
        await this.page?.goto('about:blank');
        await this.page?.evaluate((data) => {
          Object.entries(data.localStorage).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
          Object.entries(data.sessionStorage).forEach(([key, value]) => {
            sessionStorage.setItem(key, value);
          });
        }, sessionData);
      }

      console.log(`Session loaded for ${platform}/${username}`);
      return true;
    } catch (error) {
      console.error(`Failed to load session for ${platform}/${username}:`, error);
      return false;
    }
  }

  async saveSession(platform: string, username: string): Promise<void> {
    if (!this.context || !this.page) {
      throw new Error('Browser not initialized');
    }

    const sessionPath = this.getSessionPath(platform, username);
    
    try {
      const cookies = await this.context.cookies();
      const localStorage = await this.page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            data[key] = window.localStorage.getItem(key) || '';
          }
        }
        return data;
      });
      
      const sessionStorage = await this.page.evaluate(() => {
        const data: Record<string, string> = {};
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            data[key] = window.sessionStorage.getItem(key) || '';
          }
        }
        return data;
      });

      const sessionData: SessionData = {
        cookies,
        localStorage,
        sessionStorage,
        userAgent: await this.page.evaluate(() => navigator.userAgent),
        viewport: this.config.viewport || { width: 1920, height: 1080 }
      };

      fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
      console.log(`Session saved for ${platform}/${username}`);
    } catch (error) {
      console.error(`Failed to save session for ${platform}/${username}:`, error);
      throw error;
    }
  }

  private getSessionPath(platform: string, username: string): string {
    return path.join(this.sessionDir, `${platform}_${username}.json`);
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Random delay to simulate human behavior
    await randomDelay(1000, 3000);
  }

  async humanType(text: string, selector?: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    if (selector) {
      await this.page.click(selector);
      await randomDelay(200, 500);
    }

    // Type with random delays between keystrokes
    for (const char of text) {
      await this.page.keyboard.type(char, { delay: Math.random() * 100 + 50 });
      
      // Occasional longer pause
      if (Math.random() > 0.9) {
        await randomDelay(200, 500);
      }
    }
  }

  async humanClick(selector: string): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const element = await this.page.$(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const box = await element.boundingBox();
    if (!box) {
      throw new Error(`Element not visible: ${selector}`);
    }

    // Click with slight random offset
    const x = box.x + box.width / 2 + (Math.random() * 10 - 5);
    const y = box.y + box.height / 2 + (Math.random() * 10 - 5);

    await this.page.mouse.move(x, y, { steps: 10 });
    await randomDelay(100, 300);
    await this.page.mouse.click(x, y);
    
    await randomDelay(200, 500);
  }

  async humanScroll(direction: 'up' | 'down', amount: number = 3): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    for (let i = 0; i < amount; i++) {
      const scrollAmount = Math.floor(Math.random() * 200) + 100;
      await this.page.mouse.wheel(0, direction === 'down' ? scrollAmount : -scrollAmount);
      await randomDelay(300, 800);
    }
  }

  async randomFeedInteraction(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    // Scroll feed randomly
    await this.humanScroll('down', Math.floor(Math.random() * 3) + 1);
    
    // Random pause to "read"
    await randomDelay(2000, 5000);
    
    // Sometimes interact with content
    if (Math.random() > 0.7) {
      try {
        // Try to like a post
        const likeButton = await this.page.$('[data-testid="like"], .like-button, [aria-label="Like"]');
        if (likeButton) {
          await this.humanClick(await this.page.evaluate(el => {
            const selector = el.tagName.toLowerCase() + 
              (el.className ? '.' + el.className.split(' ')[0] : '') +
              (el.getAttribute('data-testid') ? `[data-testid="${el.getAttribute('data-testid')}"]` : '');
            return selector;
          }, likeButton));
        }
      } catch (e) {
        // Ignore interaction errors
      }
    }
  }

  async takeScreenshot(filename: string): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    const screenshotPath = path.join(process.cwd(), 'public', 'images', filename);
    await this.page.screenshot({ path: screenshotPath, fullPage: false });
    return screenshotPath;
  }

  async getPageContent(): Promise<string> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    return await this.page.content();
  }

  async waitForSelector(selector: string, timeout: number = 30000): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }

    await this.page.waitForSelector(selector, { timeout });
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  isInitialized(): boolean {
    return this.browser !== null && this.context !== null && this.page !== null;
  }

  getPage(): Page | null {
    return this.page;
  }
}

// Singleton instance
let browserInstance: BrowserAutomation | null = null;

export async function getBrowserInstance(config?: Partial<BrowserConfig>): Promise<BrowserAutomation> {
  if (!browserInstance || !browserInstance.isInitialized()) {
    browserInstance = new BrowserAutomation(config);
    await browserInstance.initialize();
  }
  return browserInstance;
}

export async function closeBrowserInstance(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
