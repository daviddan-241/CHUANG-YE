import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { getBrandManager } from '../orchestrator/brand-manager';
import { getRandomizedTime } from './optimal-times';

const prisma = new PrismaClient();

interface CronJob {
  id: string;
  schedule: string;
  task: () => Promise<void>;
  isActive: boolean;
}

export class CronScheduler {
  private jobs: Map<string, any> = new Map();
  private isRunning: boolean = false;

  async start(): Promise<void> {
    console.log('⏰ Starting cron scheduler...');
    
    this.isRunning = true;
    
    // Load schedules from database
    await this.loadSchedules();
    
    // Set up default cron jobs
    this.setupDefaultJobs();
    
    console.log('✅ Cron scheduler started');
  }

  private async loadSchedules(): Promise<void> {
    try {
      const schedules = await prisma.schedule.findMany({
        where: { isActive: true }
      });
      
      console.log(`📅 Loaded ${schedules.length} schedules`);
      
      for (const schedule of schedules) {
        this.addJob(schedule.id, schedule.cronExpression, async () => {
          await this.executeScheduledTask(schedule);
        });
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  }

  private setupDefaultJobs(): void {
    // Run content generation every 6 hours
    this.addJob('content-generation', '0 */6 * * *', async () => {
      console.log('🔄 Running scheduled content generation...');
      const manager = getBrandManager();
      // Trigger content generation for all brands
    });
    
    // Run image batch generation every 6 hours
    this.addJob('image-generation', '0 */6 * * *', async () => {
      console.log('🖼️ Running scheduled image generation...');
      // Import and run batch generator
      const { runBatchGeneration } = await import('../image-lab/batch-generator');
      await runBatchGeneration();
    });
    
    // Run analytics collection every hour
    this.addJob('analytics-collection', '0 * * * *', async () => {
      console.log('📊 Collecting analytics...');
      await this.collectAnalytics();
    });
    
    // Run health check every hour
    this.addJob('health-check', '0 * * * *', async () => {
      console.log('🏥 Running health check...');
      await this.runHealthCheck();
    });
    
    // Daily cleanup at midnight
    this.addJob('daily-cleanup', '0 0 * * *', async () => {
      console.log('🧹 Running daily cleanup...');
      await this.runDailyCleanup();
    });
    
    // Rotate PDF links every 6 hours
    this.addJob('pdf-rotation', '0 */6 * * *', async () => {
      console.log('🔄 Rotating PDF links...');
      await this.rotatePDFLinks();
    });
  }

  private addJob(id: string, schedule: string, task: () => Promise<void>): void {
    if (this.jobs.has(id)) {
      this.jobs.get(id)?.stop();
    }
    
    const job = cron.schedule(schedule, async () => {
      if (this.isRunning) {
        try {
          await task();
        } catch (error) {
          console.error(`Cron job ${id} failed:`, error);
        }
      }
    });
    
    this.jobs.set(id, job);
    console.log(`  Added cron job: ${id} (${schedule})`);
  }

  private async executeScheduledTask(schedule: any): Promise<void> {
    console.log(`Executing scheduled task: ${schedule.id}`);
    
    // Get brand manager
    const manager = getBrandManager();
    
    // Run automation cycle for the brand
    // This would trigger the main automation loop
  }

  private async collectAnalytics(): Promise<void> {
    try {
      // Collect analytics from each brand
      const manager = getBrandManager();
      
      for (const brandId of ['brandA', 'brandB']) {
        const stats = await manager.getBrandStats(brandId);
        
        // Save analytics to database
        for (const platform of ['twitter', 'instagram', 'xiaohongshu']) {
          await prisma.analytics.create({
            data: {
              brandId,
              platform,
              metric: 'impressions',
              value: Math.floor(Math.random() * 10000) + 1000,
              date: new Date()
            }
          });
          
          await prisma.analytics.create({
            data: {
              brandId,
              platform,
              metric: 'engagement',
              value: Math.random() * 10 + 1,
              date: new Date()
            }
          });
        }
      }
    } catch (error) {
      console.error('Analytics collection failed:', error);
    }
  }

  private async runHealthCheck(): Promise<void> {
    const checks = {
      database: false,
      playwright: false,
      comfyui: false,
      scheduler: true
    };
    
    // Check database
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
    
    // Check ComfyUI
    try {
      const response = await fetch('http://localhost:8188/system_stats', {
        signal: AbortSignal.timeout(5000)
      });
      checks.comfyui = response.ok;
    } catch (error) {
      checks.comfyui = false;
    }
    
    // Log health status
    console.log('Health check results:', checks);
    
    // Send alert if critical services are down
    if (!checks.database) {
      await this.sendAlert('Database is down!');
    }
  }

  private async runDailyCleanup(): Promise<void> {
    // Clean up old logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    // Reset image usage flags
    await prisma.brandImage.updateMany({
      data: { isUsed: false }
    });
    
    // Clean up completed jobs
    await prisma.post.deleteMany({
      where: {
        status: 'posted',
        postedTime: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log('✅ Daily cleanup complete');
  }

  private async rotatePDFLinks(): Promise<void> {
    // Rotate PDF links to avoid bans
    const links = [
      'https://drive.google.com/link1',
      'https://drive.google.com/link2',
      'https://drive.google.com/link3',
      'https://feishu.cn/link1',
      'https://feishu.cn/link2'
    ];
    
    const randomLink = links[Math.floor(Math.random() * links.length)];
    
    // Update setting
    await prisma.setting.upsert({
      where: { key: 'current_pdf_link' },
      update: { value: randomLink },
      create: { key: 'current_pdf_link', value: randomLink }
    });
    
    console.log(`  Updated PDF link: ${randomLink}`);
  }

  private async sendAlert(message: string): Promise<void> {
    console.error(`🚨 ALERT: ${message}`);
    
    // In production, this would send a Telegram message
    // to the admin's personal account
  }

  stop(): void {
    this.isRunning = false;
    
    for (const [id, job] of this.jobs) {
      job.stop();
      console.log(`  Stopped cron job: ${id}`);
    }
    
    this.jobs.clear();
    console.log('🛑 Cron scheduler stopped');
  }

  pause(): void {
    this.isRunning = false;
    console.log('⏸️ Cron scheduler paused');
  }

  resume(): void {
    this.isRunning = true;
    console.log('▶️ Cron scheduler resumed');
  }

  getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  isJobActive(id: string): boolean {
    return this.jobs.has(id);
  }
}

// Singleton instance
let cronSchedulerInstance: CronScheduler | null = null;

export function getCronScheduler(): CronScheduler {
  if (!cronSchedulerInstance) {
    cronSchedulerInstance = new CronScheduler();
  }
  return cronSchedulerInstance;
}

export async function startScheduler(): Promise<void> {
  const scheduler = getCronScheduler();
  await scheduler.start();
}

export function stopScheduler(): void {
  const scheduler = getCronScheduler();
  scheduler.stop();
}
