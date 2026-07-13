import { PrismaClient } from '@prisma/client';
import { getActionLogger } from './action-logger';
import { exec } from 'child_process';
import { promisify } from 'util';

const prisma = new PrismaClient();
const execAsync = promisify(exec);

interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  message: string;
  lastCheck: Date;
  uptime?: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: HealthStatus[];
  timestamp: Date;
}

export class HealthChecker {
  private checkInterval: NodeJS.Timeout | null = null;
  private alertThreshold: number = 3; // consecutive failures before alert
  private failureCounts: Map<string, number> = new Map();

  async start(intervalMinutes: number = 60): Promise<void> {
    console.log('🏥 Starting health checker...');
    
    // Initial check
    await this.runHealthCheck();
    
    // Set up periodic checks
    this.checkInterval = setInterval(async () => {
      await this.runHealthCheck();
    }, intervalMinutes * 60 * 1000);
    
    console.log(`✅ Health checker started (checking every ${intervalMinutes} minutes)`);
  }

  async runHealthCheck(): Promise<SystemHealth> {
    console.log('🏥 Running health check...');
    
    const services: HealthStatus[] = [];
    
    // Check database
    services.push(await this.checkDatabase());
    
    // Check Playwright
    services.push(await this.checkPlaywright());
    
    // Check ComfyUI
    services.push(await this.checkComfyUI());
    
    // Check Redis (optional)
    services.push(await this.checkRedis());
    
    // Check disk space
    services.push(await this.checkDiskSpace());
    
    // Check brand sessions
    services.push(await this.checkBrandSessions());
    
    // Check scheduled posts
    services.push(await this.checkScheduledPosts());
    
    // Determine overall health
    const downServices = services.filter(s => s.status === 'down');
    const degradedServices = services.filter(s => s.status === 'degraded');
    
    let overall: 'healthy' | 'degraded' | 'down';
    if (downServices.length > 0) {
      overall = 'down';
    } else if (degradedServices.length > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }
    
    const health: SystemHealth = {
      overall,
      services,
      timestamp: new Date()
    };
    
    // Log health status
    await this.logHealth(health);
    
    // Send alerts if needed
    await this.checkAlerts(services);
    
    return health;
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;
      
      return {
        service: 'database',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        message: `Response time: ${responseTime}ms`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'database',
        status: 'down',
        message: error instanceof Error ? error.message : 'Connection failed',
        lastCheck: new Date()
      };
    }
  }

  private async checkPlaywright(): Promise<HealthStatus> {
    try {
      // Check if Playwright is installed
      const { stdout } = await execAsync('npx playwright --version');
      
      return {
        service: 'playwright',
        status: 'healthy',
        message: `Version: ${stdout.trim()}`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'playwright',
        status: 'down',
        message: 'Playwright not available',
        lastCheck: new Date()
      };
    }
  }

  private async checkComfyUI(): Promise<HealthStatus> {
    try {
      const response = await fetch('http://localhost:8188/system_stats', {
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          service: 'comfyui',
          status: 'healthy',
          message: 'Connected',
          lastCheck: new Date()
        };
      }
      
      return {
        service: 'comfyui',
        status: 'down',
        message: `HTTP ${response.status}`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'comfyui',
        status: 'down',
        message: 'Connection refused',
        lastCheck: new Date()
      };
    }
  }

  private async checkRedis(): Promise<HealthStatus> {
    try {
      // Try to connect to Redis
      const Redis = require('ioredis');
      const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      
      const start = Date.now();
      await redis.ping();
      const responseTime = Date.now() - start;
      
      await redis.disconnect();
      
      return {
        service: 'redis',
        status: responseTime < 100 ? 'healthy' : 'degraded',
        message: `Response time: ${responseTime}ms`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'redis',
        status: 'degraded',
        message: 'Redis not available (optional)',
        lastCheck: new Date()
      };
    }
  }

  private async checkDiskSpace(): Promise<HealthStatus> {
    try {
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.split(/\s+/);
      const usage = parseInt(parts[4]);
      
      return {
        service: 'disk',
        status: usage < 80 ? 'healthy' : usage < 90 ? 'degraded' : 'down',
        message: `Usage: ${usage}%`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'disk',
        status: 'healthy',
        message: 'Unable to check',
        lastCheck: new Date()
      };
    }
  }

  private async checkBrandSessions(): Promise<HealthStatus> {
    try {
      const sessions = await prisma.session.count();
      const brands = await prisma.brand.count({ where: { isActive: true } });
      
      return {
        service: 'sessions',
        status: sessions >= brands ? 'healthy' : 'degraded',
        message: `${sessions} sessions for ${brands} brands`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'sessions',
        status: 'down',
        message: 'Failed to check sessions',
        lastCheck: new Date()
      };
    }
  }

  private async checkScheduledPosts(): Promise<HealthStatus> {
    try {
      const scheduled = await prisma.post.count({
        where: { status: 'scheduled' }
      });
      
      const failed = await prisma.post.count({
        where: { status: 'failed' }
      });
      
      return {
        service: 'scheduler',
        status: failed === 0 ? 'healthy' : 'degraded',
        message: `${scheduled} scheduled, ${failed} failed`,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'scheduler',
        status: 'down',
        message: 'Failed to check scheduler',
        lastCheck: new Date()
      };
    }
  }

  private async logHealth(health: SystemHealth): Promise<void> {
    const logger = getActionLogger();
    
    await logger.log({
      action: 'health_check',
      details: `Overall: ${health.overall}`,
      status: health.overall === 'healthy' ? 'success' : 'warning',
      metadata: {
        services: health.services.map(s => ({
          name: s.service,
          status: s.status
        }))
      }
    });
  }

  private async checkAlerts(services: HealthStatus[]): Promise<void> {
    for (const service of services) {
      if (service.status === 'down') {
        const failures = (this.failureCounts.get(service.service) || 0) + 1;
        this.failureCounts.set(service.service, failures);
        
        if (failures >= this.alertThreshold) {
          await this.sendAlert(service);
          this.failureCounts.set(service.service, 0); // Reset after alert
        }
      } else {
        this.failureCounts.set(service.service, 0);
      }
    }
  }

  private async sendAlert(service: HealthStatus): Promise<void> {
    const message = `🚨 ALERT: ${service.service} is DOWN!\n\nMessage: ${service.message}\nTime: ${new Date().toISOString()}`;
    
    console.error(message);
    
    // Send Telegram alert
    try {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (telegramToken && chatId) {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
          })
        });
      }
    } catch (error) {
      console.error('Failed to send Telegram alert:', error);
    }
  }

  async getHealthHistory(hours: number = 24): Promise<any[]> {
    try {
      const logs = await prisma.activityLog.findMany({
        where: {
          action: 'health_check',
          createdAt: {
            gte: new Date(Date.now() - hours * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return logs;
    } catch (error) {
      console.error('Failed to fetch health history:', error);
      return [];
    }
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🛑 Health checker stopped');
  }
}

// Singleton instance
let healthCheckerInstance: HealthChecker | null = null;

export function getHealthChecker(): HealthChecker {
  if (!healthCheckerInstance) {
    healthCheckerInstance = new HealthChecker();
  }
  return healthCheckerInstance;
}

export async function startHealthChecking(intervalMinutes: number = 60): Promise<void> {
  const checker = getHealthChecker();
  await checker.start(intervalMinutes);
}
