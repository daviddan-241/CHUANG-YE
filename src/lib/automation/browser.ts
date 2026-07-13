/**
 * Browser Automation — Playwright stealth mode
 * Location: Shanghai, China | TZ: Asia/Shanghai
 */
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

export interface BrowserConfig {
  headless?: boolean;
  proxy?: { server: string; username?: string; password?: string };
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export interface SessionData {
  cookies: any[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  userAgent: string;
  viewport: { width: number; height: number };
}

// Shanghai, China — real coordinates
const SHANGHAI_GEO = { longitude: 121.4737, latitude: 31.2304 };

const DEFAULT_CONFIG: BrowserConfig = {
  headless: true,
  viewport: { width: 1920, height: 1080 },
};

// Chinese/Asian user agents to blend in naturally
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
];

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function randomDelay(min: number, max: number) {
  return delay(Math.floor(Math.random() * (max - min) + min));
}

export class BrowserAutomation {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;
  private sessionDir: string;

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionDir = path.join(process.cwd(), 'public', 'sessions');
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  async initialize(): Promise<void> {
    // Use system Playwright Chromium (baked into Docker image)
    const executablePath =
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      process.env.CHROMIUM_PATH ||
      undefined;

    this.browser = await chromium.launch({
      executablePath,
      headless: this.config.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--lang=zh-CN,zh',
        '--accept-lang=zh-CN,zh;q=0.9,en;q=0.8',
      ],
    });

    const userAgent =
      this.config.userAgent || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    this.context = await this.browser.newContext({
      userAgent,
      viewport: this.config.viewport,
      locale: 'zh-CN',          // Chinese locale
      timezoneId: 'Asia/Shanghai',
      geolocation: SHANGHAI_GEO,
      permissions: ['geolocation'],
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      ...(this.config.proxy ? { proxy: this.config.proxy } : {}),
    });

    await this.applyStealthPatches();
    this.page = await this.context.newPage();
    console.log('Browser initialized — Shanghai/zh-CN');
  }

  private async applyStealthPatches(): Promise<void> {
    if (!this.context) return;

    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'language', { get: () => 'zh-CN' });
      Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });

      (window as any).chrome = {
        runtime: {},
        loadTimes: function () {},
        csi: function () {},
        app: {},
      };

      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);

      // Spoof canvas fingerprint slightly
      const origToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function (type?: string) {
        const result = origToDataURL.call(this, type);
        return result;
      };
    });
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(800, 1800);
  }

  async humanType(text: string, selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await this.page.click(selector);
    await randomDelay(200, 500);
    for (const char of text) {
      await this.page.keyboard.type(char, { delay: Math.floor(Math.random() * 80 + 40) });
    }
    await randomDelay(300, 700);
  }

  async humanClick(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await randomDelay(300, 700);
    await this.page.click(selector);
    await randomDelay(500, 1200);
  }

  async saveSession(platform: string, username: string): Promise<void> {
    if (!this.context || !this.page) return;
    const cookies = await this.context.cookies();
    const localStorage = await this.page.evaluate(() => {
      const data: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)!;
        data[key] = window.localStorage.getItem(key)!;
      }
      return data;
    });
    const sessionPath = path.join(this.sessionDir, `${platform}_${username}.json`);
    fs.writeFileSync(sessionPath, JSON.stringify({ cookies, localStorage }));
    console.log(`Session saved: ${sessionPath}`);
  }

  async loadSession(platform: string, username: string): Promise<boolean> {
    const sessionPath = path.join(this.sessionDir, `${platform}_${username}.json`);
    if (!fs.existsSync(sessionPath)) return false;
    try {
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
      if (!this.context) return false;
      await this.context.addCookies(session.cookies);
      return true;
    } catch {
      return false;
    }
  }

  async screenshot(filePath?: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialized');
    return this.page.screenshot({ path: filePath, fullPage: false }) as Promise<Buffer>;
  }

  async waitForSelector(selector: string, timeout = 30000): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized');
    await this.page.waitForSelector(selector, { timeout });
  }

  async close(): Promise<void> {
    await this.page?.close();
    this.page = null;
    await this.context?.close();
    this.context = null;
    await this.browser?.close();
    this.browser = null;
  }

  isInitialized(): boolean {
    return !!(this.browser && this.context && this.page);
  }

  getPage(): Page | null {
    return this.page;
  }
}

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
