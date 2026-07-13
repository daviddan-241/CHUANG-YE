import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import { TopicFinder } from '../content-generator/topic-finder';
import { PostWriter } from '../content-generator/post-writer';
import { ConsistencyChecker } from '../content-generator/consistency-checker';
import { BatchGenerator } from '../image-lab/batch-generator';
import { FakeEngagement } from '../bootstrap/fake-engagement';
import { DMTrigger } from '../auto-responder/dm-trigger';
import { PaymentProcessor } from '../auto-responder/payment-processor';
import { getOptimalTimes } from '../scheduler/optimal-times';

const prisma = new PrismaClient();

interface BrandConfig {
  id: string;
  name: string;
  persona: string;
  platforms: string[];
  postingSchedule: Record<string, string[]>;
  maxPostsPerDay: number;
  engagementEnabled: boolean;
  dmMonitoringEnabled: boolean;
}

interface AutomationState {
  isRunning: boolean;
  currentTask: string | null;
  lastRun: Date | null;
  errors: string[];
}

export class BrandManager extends EventEmitter {
  private brands: Map<string, BrandConfig> = new Map();
  private states: Map<string, AutomationState> = new Map();
  private mainLoopIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    this.initializeDefaultBrands();
  }

  private initializeDefaultBrands(): void {
    // Brand A - VelocityEdge (English market)
    this.brands.set('brandA', {
      id: 'brandA',
      name: 'VelocityEdge',
      persona: 'VelocityEdge',
      platforms: ['twitter', 'instagram', 'telegram'],
      postingSchedule: {
        twitter: ['08:00', '12:00', '18:00'],
        instagram: ['07:00', '11:00', '19:00'],
        telegram: ['09:00', '15:00', '21:00']
      },
      maxPostsPerDay: 3,
      engagementEnabled: true,
      dmMonitoringEnabled: true
    });

    // Brand B - ChuangYe (Chinese market)
    this.brands.set('brandB', {
      id: 'brandB',
      name: 'ChuangYe',
      persona: 'ChuangYe',
      platforms: ['xiaohongshu', 'wechat', 'douyin'],
      postingSchedule: {
        xiaohongshu: ['09:00', '13:00', '20:00'],
        wechat: ['08:00', '12:00', '18:00'],
        douyin: ['10:00', '14:00', '21:00']
      },
      maxPostsPerDay: 3,
      engagementEnabled: true,
      dmMonitoringEnabled: true
    });

    // Initialize states
    for (const [brandId] of this.brands) {
      this.states.set(brandId, {
        isRunning: false,
        currentTask: null,
        lastRun: null,
        errors: []
      });
    }
  }

  async startBrand(brandId: string): Promise<void> {
    const brand = this.brands.get(brandId);
    if (!brand) {
      throw new Error(`Brand ${brandId} not found`);
    }

    const state = this.states.get(brandId)!;
    if (state.isRunning) {
      console.log(`Brand ${brandId} is already running`);
      return;
    }

    console.log(`🚀 Starting brand: ${brand.name}`);
    
    state.isRunning = true;
    state.currentTask = 'initializing';
    this.states.set(brandId, state);
    this.emit('brandStarted', brandId);

    // Start DM monitoring if enabled
    if (brand.dmMonitoringEnabled) {
      const dmTrigger = new DMTrigger();
      await dmTrigger.initialize();
      await dmTrigger.startMonitoring(brandId);
    }

    // Start main automation loop
    this.startMainLoop(brandId);
    
    console.log(`✅ Brand ${brand.name} started`);
  }

  private startMainLoop(brandId: string): void {
    const brand = this.brands.get(brandId)!;
    
    // Run main loop every hour
    const interval = setInterval(async () => {
      await this.runAutomationCycle(brandId);
    }, 60 * 60 * 1000);
    
    this.mainLoopIntervals.set(brandId, interval);
    
    // Run initial cycle
    this.runAutomationCycle(brandId);
  }

  private async runAutomationCycle(brandId: string): Promise<void> {
    const brand = this.brands.get(brandId)!;
    const state = this.states.get(brandId)!;
    
    console.log(`🔄 Running automation cycle for ${brand.name}...`);
    
    try {
      // Step 1: Find trending topics
      state.currentTask = 'finding topics';
      this.states.set(brandId, state);
      
      const topicFinder = new TopicFinder();
      await topicFinder.initialize();
      const topics = await topicFinder.findTopics();
      await topicFinder.close();
      
      // Save topics to database
      for (const topic of topics.slice(0, 5)) {
        await prisma.topic.create({
          data: {
            topic: topic.topic,
            angle: topic.angle,
            platform: topic.platform,
            source: topic.source
          }
        });
      }
      
      // Step 2: Generate posts for each platform
      state.currentTask = 'generating posts';
      this.states.set(brandId, state);
      
      const postWriter = new PostWriter();
      const checker = new ConsistencyChecker(brand.persona);
      
      for (const platform of brand.platforms) {
        // Get optimal posting times
        const times = getOptimalTimes(platform);
        const now = new Date();
        
        // Generate posts for each time slot
        for (const time of times) {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date(now);
          scheduledTime.setHours(hours, minutes, 0, 0);
          
          // If time has passed, schedule for tomorrow
          if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
          }
          
          // Pick a random topic
          const topic = topics[Math.floor(Math.random() * topics.length)];
          if (!topic) continue;
          
          // Generate post variations
          const variations = await postWriter.generatePostVariations(
            topic.topic,
            topic.angle,
            brand.name
          );
          
          // Pick a random variation
          const post = variations[Math.floor(Math.random() * variations.length)];
          
          // Check consistency
          const checkResult = await checker.check(post.text, platform);
          
          if (!checkResult.isDuplicate) {
            // Save post to database
            await prisma.post.create({
              data: {
                brandId,
                text: checkResult.adjustedText,
                imagePrompt: post.imagePrompt,
                platform,
                status: 'scheduled',
                scheduledTime,
                hash: checkResult.hash
              }
            });
            
            console.log(`  📝 Scheduled post for ${platform} at ${time}`);
          }
        }
      }
      
      // Step 3: Generate images
      state.currentTask = 'generating images';
      this.states.set(brandId, state);
      
      const batchGenerator = new BatchGenerator({ brands: [brandId] });
      await batchGenerator.generateBatch();
      
      // Step 4: Post scheduled content
      state.currentTask = 'posting content';
      this.states.set(brandId, state);
      
      await this.postScheduledContent(brandId);
      
      // Update state
      state.currentTask = null;
      state.lastRun = new Date();
      state.errors = [];
      this.states.set(brandId, state);
      
      console.log(`✅ Automation cycle complete for ${brand.name}`);
      
    } catch (error) {
      console.error(`❌ Automation cycle failed for ${brand.name}:`, error);
      
      state.errors.push(error instanceof Error ? error.message : 'Unknown error');
      state.currentTask = null;
      this.states.set(brandId, state);
      
      this.emit('error', { brandId, error });
    }
  }

  private async postScheduledContent(brandId: string): Promise<void> {
    const now = new Date();
    
    // Find posts that should be posted now
    const duePosts = await prisma.post.findMany({
      where: {
        brandId,
        status: 'scheduled',
        scheduledTime: {
          lte: now
        }
      },
      orderBy: {
        scheduledTime: 'asc'
      }
    });
    
    console.log(`  📤 Found ${duePosts.length} posts to publish`);
    
    for (const post of duePosts) {
      try {
        // Get image for post
        const batchGenerator = new BatchGenerator();
        const imagePath = await batchGenerator.getRandomImage(brandId, 'lifestyle');
        
        // Post to platform
        await this.publishPost(post, imagePath);
        
        // Update status
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'posted',
            postedTime: new Date(),
            imagePath
          }
        });
        
        console.log(`  ✅ Posted to ${post.platform}`);
        
        // Trigger fake engagement if enabled
        const brand = this.brands.get(brandId)!;
        if (brand.engagementEnabled) {
          const fakeEngagement = new FakeEngagement();
          // Trigger engagement after a delay
          setTimeout(async () => {
            // This would trigger engagement from burner accounts
            console.log(`  🎯 Triggering fake engagement for post ${post.id}`);
          }, 60000); // 1 minute delay
        }
        
        // Random delay between posts
        await this.delay(Math.random() * 30000 + 10000);
        
      } catch (error) {
        console.error(`  ❌ Failed to post ${post.id}:`, error);
        
        // Update with error
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            retryCount: { increment: 1 }
          }
        });
      }
    }
  }

  private async publishPost(post: any, imagePath: string | null): Promise<void> {
    // This would use Playwright to post to the platform
    // For now, we'll simulate the posting
    console.log(`    Publishing: ${post.text.substring(0, 50)}...`);
    
    // Simulate posting delay
    await this.delay(2000);
  }

  async stopBrand(brandId: string): Promise<void> {
    const state = this.states.get(brandId);
    if (!state || !state.isRunning) {
      return;
    }
    
    console.log(`🛑 Stopping brand: ${brandId}`);
    
    // Clear main loop
    const interval = this.mainLoopIntervals.get(brandId);
    if (interval) {
      clearInterval(interval);
      this.mainLoopIntervals.delete(brandId);
    }
    
    // Update state
    state.isRunning = false;
    state.currentTask = null;
    this.states.set(brandId, state);
    
    this.emit('brandStopped', brandId);
  }

  async stopAll(): Promise<void> {
    console.log('🛑 Stopping all brands...');
    
    for (const brandId of this.brands.keys()) {
      await this.stopBrand(brandId);
    }
  }

  getBrandConfig(brandId: string): BrandConfig | undefined {
    return this.brands.get(brandId);
  }

  getBrandState(brandId: string): AutomationState | undefined {
    return this.states.get(brandId);
  }

  getAllBrandStates(): Map<string, AutomationState> {
    return this.states;
  }

  async getBrandStats(brandId: string): Promise<any> {
    const posts = await prisma.post.groupBy({
      by: ['status'],
      where: { brandId },
      _count: true
    });
    
    const analytics = await prisma.analytics.findMany({
      where: { brandId },
      orderBy: { date: 'desc' },
      take: 30
    });
    
    const conversions = await prisma.conversion.aggregate({
      where: { brandId, status: 'delivered' },
      _count: true,
      _sum: { amount: true }
    });
    
    return {
      posts: posts.reduce((acc, p) => {
        acc[p.status] = p._count;
        return acc;
      }, {} as Record<string, number>),
      analytics,
      conversions: {
        total: conversions._count,
        revenue: conversions._sum.amount || 0
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let brandManagerInstance: BrandManager | null = null;

export function getBrandManager(): BrandManager {
  if (!brandManagerInstance) {
    brandManagerInstance = new BrandManager();
  }
  return brandManagerInstance;
}

export async function startAllBrands(): Promise<void> {
  const manager = getBrandManager();
  
  await manager.startBrand('brandA');
  await manager.startBrand('brandB');
  
  console.log('🚀 All brands started');
}

export async function stopAllBrands(): Promise<void> {
  const manager = getBrandManager();
  await manager.stopAll();
  console.log('🛑 All brands stopped');
}
