import { chromium, Browser, Page } from 'playwright';

export interface TrendingTopic {
  topic: string;
  angle: string;
  platform: string;
  source: string;
  popularity: number;
  timestamp: Date;
}

interface TopicFinderConfig {
  proxy?: string;
  maxTopicsPerSource: number;
  keywords: string[];
}

const DEFAULT_CONFIG: TopicFinderConfig = {
  maxTopicsPerSource: 10,
  keywords: [
    'side income', 'passive income', 'AI tools', 'automation',
    'digital nomad', 'cross-border', 'remote work', 'online business',
    'freelancing', 'dropshipping', 'affiliate marketing', 'content creation',
    '副业', '被动收入', 'AI工具', '自动化', '跨境电商', '远程工作',
    '在线创业', '自由职业', '数字游民', '被动收入'
  ]
};

export class TopicFinder {
  private config: TopicFinderConfig;
  private browser: Browser | null = null;

  constructor(config: Partial<TopicFinderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async findTopics(): Promise<TrendingTopic[]> {
    console.log('🔍 Finding trending topics...');
    
    const topics: TrendingTopic[] = [];
    
    try {
      // Run all scrapers in parallel
      const [twitterTopics, redditTopics, googleTopics] = await Promise.allSettled([
        this.scrapeTwitterTrends(),
        this.scrapeRedditTopics(),
        this.scrapeGoogleTrends()
      ]);

      if (twitterTopics.status === 'fulfilled') topics.push(...twitterTopics.value);
      if (redditTopics.status === 'fulfilled') topics.push(...redditTopics.value);
      if (googleTopics.status === 'fulfilled') topics.push(...googleTopics.value);

      // Filter and rank topics
      const filteredTopics = this.filterTopics(topics);
      
      console.log(`✅ Found ${filteredTopics.length} trending topics`);
      return filteredTopics;
    } catch (error) {
      console.error('❌ Error finding topics:', error);
      return this.getFallbackTopics();
    }
  }

  private async scrapeTwitterTrends(): Promise<TrendingTopic[]> {
    const topics: TrendingTopic[] = [];
    
    if (!this.browser) await this.initialize();
    const page = await this.browser!.newPage();
    
    try {
      // Use trends24.in for Twitter trending topics
      await page.goto('https://trends24.in/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for trends to load
      await page.waitForSelector('.trend-card', { timeout: 10000 });
      
      // Extract trending topics
      const trends = await page.evaluate(() => {
        const trendCards = document.querySelectorAll('.trend-card__list li a');
        return Array.from(trendCards).slice(0, 20).map(el => ({
          topic: el.textContent?.trim() || '',
          href: (el as HTMLAnchorElement).href || ''
        }));
      });

      // Filter for relevant keywords
      for (const trend of trends) {
        const relevance = this.calculateRelevance(trend.topic);
        if (relevance > 0.3) {
          topics.push({
            topic: trend.topic,
            angle: this.generateAngle(trend.topic, 'twitter'),
            platform: 'twitter',
            source: 'trends24.in',
            popularity: relevance,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Twitter scraping failed:', error);
    } finally {
      await page.close();
    }

    return topics;
  }

  private async scrapeRedditTopics(): Promise<TrendingTopic[]> {
    const topics: TrendingTopic[] = [];
    
    if (!this.browser) await this.initialize();
    const page = await this.browser!.newPage();
    
    const subreddits = [
      'Entrepreneur', 'passive_income', 'digitalnomad',
      'SideProject', 'startups', 'OnlineIncome'
    ];

    for (const subreddit of subreddits) {
      try {
        await page.goto(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, {
          waitUntil: 'networkidle',
          timeout: 20000
        });

        const content = await page.textContent('body');
        if (content) {
          const data = JSON.parse(content);
          const posts = data?.data?.children || [];

          for (const post of posts.slice(0, 10)) {
            const title = post.data?.title || '';
            const relevance = this.calculateRelevance(title);
            
            if (relevance > 0.3) {
              topics.push({
                topic: title,
                angle: this.generateAngle(title, 'reddit'),
                platform: 'multiple',
                source: `r/${subreddit}`,
                popularity: relevance * (post.data?.score || 1) / 1000,
                timestamp: new Date()
              });
            }
          }
        }
      } catch (error) {
        console.error(`Reddit r/${subreddit} failed:`, error);
      }
    }

    await page.close();
    return topics;
  }

  private async scrapeGoogleTrends(): Promise<TrendingTopic[]> {
    const topics: TrendingTopic[] = [];
    
    if (!this.browser) await this.initialize();
    const page = await this.browser!.newPage();
    
    try {
      // Scrape Google Trends
      await page.goto('https://trends.google.com/trending?geo=US', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      await page.waitForTimeout(3000);

      const trends = await page.evaluate(() => {
        const elements = document.querySelectorAll('[class*="trend"]');
        return Array.from(elements).slice(0, 20).map(el => ({
          topic: el.textContent?.trim() || ''
        })).filter(t => t.topic.length > 0);
      });

      for (const trend of trends) {
        const relevance = this.calculateRelevance(trend.topic);
        if (relevance > 0.2) {
          topics.push({
            topic: trend.topic,
            angle: this.generateAngle(trend.topic, 'google'),
            platform: 'multiple',
            source: 'google_trends',
            popularity: relevance,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Google Trends scraping failed:', error);
    }

    await page.close();
    return topics;
  }

  private calculateRelevance(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    for (const keyword of this.config.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 0.3;
      }
    }
    
    // Boost score for certain patterns
    if (/\d+/.test(text)) score += 0.1; // Contains numbers
    if (/\$|¥|€|£/.test(text)) score += 0.2; // Contains currency
    if (/how|why|what|秘诀|方法|技巧/.test(lowerText)) score += 0.15; // Question format
    
    return Math.min(score, 1);
  }

  private generateAngle(topic: string, source: string): string {
    const angles = [
      `How I made $5000 with ${topic}`,
      `The truth about ${topic} nobody tells you`,
      `5 mistakes killing your ${topic} results`,
      `From 0 to 10K followers with ${topic}`,
      `${topic}: Beginner's guide to passive income`,
      `Why ${topic} is the future of online income`,
      `I tried ${topic} for 30 days - here's what happened`,
      `The lazy person's guide to ${topic}`,
      `${topic} secret that gurus don't want you to know`,
      `How to automate ${topic} and earn while you sleep`
    ];

    return angles[Math.floor(Math.random() * angles.length)];
  }

  private filterTopics(topics: TrendingTopic[]): TrendingTopic[] {
    // Remove duplicates
    const unique = topics.filter((topic, index, self) =>
      index === self.findIndex(t => t.topic.toLowerCase() === topic.topic.toLowerCase())
    );

    // Sort by popularity
    return unique
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, this.config.maxTopicsPerSource * 3);
  }

  private getFallbackTopics(): TrendingTopic[] {
    const fallbackTopics = [
      { topic: 'AI side hustle 2026', angle: 'How I make $3000/month with AI tools', platform: 'twitter', source: 'fallback' },
      { topic: 'Passive income for beginners', angle: '5 ways to earn while you sleep', platform: 'instagram', source: 'fallback' },
      { topic: 'Remote work automation', angle: 'Automate your 9-5 and earn more', platform: 'twitter', source: 'fallback' },
      { topic: 'Cross-border ecommerce', angle: 'Start selling globally with $0', platform: 'xiaohongshu', source: 'fallback' },
      { topic: 'Content creation monetization', angle: 'Turn followers into dollars', platform: 'instagram', source: 'fallback' },
      { topic: 'AI tools for business', angle: 'Top 10 AI tools that print money', platform: 'twitter', source: 'fallback' },
      { topic: 'Digital nomad lifestyle', angle: 'Work from anywhere, earn everywhere', platform: 'instagram', source: 'fallback' },
      { topic: 'Freelancing to freedom', angle: 'Quit your job in 6 months', platform: 'twitter', source: 'fallback' },
      { topic: 'Social media automation', angle: 'Grow while you sleep', platform: 'xiaohongshu', source: 'fallback' },
      { topic: 'Online course creation', angle: 'Sell what you know', platform: 'instagram', source: 'fallback' }
    ];

    return fallbackTopics.map(t => ({
      ...t,
      popularity: Math.random() * 0.5 + 0.5,
      timestamp: new Date()
    }));
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  const finder = new TopicFinder();
  try {
    await finder.initialize();
    return await finder.findTopics();
  } finally {
    await finder.close();
  }
}
