/**
 * Browser Automation — Playwright stealth
 * Location: Shanghai, China | TZ: Asia/Shanghai
 *
 * PLAYWRIGHT_BROWSERS_PATH env var controls where browsers live.
 * On Render it is set to /opt/render/project/src/.playwright-browsers
 * and Playwright finds the binary automatically — no executablePath needed.
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

// Shanghai, China — real coordinates
const SHANGHAI_GEO = { longitude: 121.4737, latitude: 31.2304 };

const DEFAULT_CONFIG: BrowserConfig = {
  headless: true,
  viewport: { width: 1920, height: 1080 },
};

// Windows/Chrome user agents — most common in China
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

async function randomDelay(min: number, max: number) {
  return new Promise((r) => setTimeout(r, Math.floor(Math.random() * (max - min) + min)));
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
    // Let Playwright find Chromium via PLAYWRIGHT_BROWSERS_PATH (set in render.yaml / .env)
    // Do NOT hard-code executablePath — it breaks when browsers are in a custom path.
    this.browser = await chromium.launch({
      headless: this.config.headless ?? true,
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
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      geolocation: SHANGHAI_GEO,
      permissions: ['geolocation'],
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: { 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8' },
      ...(this.config.proxy ? { proxy: this.config.proxy } : {}),
    });

    await this.applyStealthPatches();
    this.page = await this.context.newPage();
    console.log('Browser initialised — Shanghai/zh-CN locale');
  }

  private async applyStealthPatches(): Promise<void> {
    if (!this.context) return;
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'language', { get: () => 'zh-CN' });
      Object.defineProperty(navigator, 'languages', { get: () => ['zh-CN', 'zh', 'en'] });
      (window as any).chrome = { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} };
      const origQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (p: any) =>
        p.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : origQuery(p);
    });
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialised');
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(800, 1800);
  }

  async humanType(text: string, selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialised');
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await this.page.click(selector);
    await randomDelay(200, 500);
    for (const char of text) {
      await this.page.keyboard.type(char, { delay: Math.floor(Math.random() * 80 + 40) });
    }
    await randomDelay(300, 700);
  }

  async humanClick(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialised');
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await randomDelay(300, 700);
    await this.page.click(selector);
    await randomDelay(500, 1200);
  }

  async saveSession(platform: string, username: string): Promise<void> {
    if (!this.context || !this.page) return;
    const cookies = await this.context.cookies();
    const localStorage = await this.page.evaluate(() => {
      const d: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)!;
        d[k] = window.localStorage.getItem(k)!;
      }
      return d;
    });
    const p = path.join(this.sessionDir, `${platform}_${username}.json`);
    fs.writeFileSync(p, JSON.stringify({ cookies, localStorage }));
  }

  async loadSession(platform: string, username: string): Promise<boolean> {
    const p = path.join(this.sessionDir, `${platform}_${username}.json`);
    if (!fs.existsSync(p)) return false;
    try {
      const s = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (!this.context) return false;
      await this.context.addCookies(s.cookies);
      return true;
    } catch { return false; }
  }

  async screenshot(filePath?: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialised');
    return this.page.screenshot({ path: filePath, fullPage: false }) as Promise<Buffer>;
  }

  async waitForSelector(selector: string, timeout = 30000): Promise<void> {
    if (!this.page) throw new Error('Browser not initialised');
    await this.page.waitForSelector(selector, { timeout });
  }

  async close(): Promise<void> {
    await this.page?.close(); this.page = null;
    await this.context?.close(); this.context = null;
    await this.browser?.close(); this.browser = null;
  }

  isInitialized(): boolean { return !!(this.browser && this.context && this.page); }
  getPage(): Page | null { return this.page; }
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
  if (browserInstance) { await browserInstance.close(); browserInstance = null; }
}
