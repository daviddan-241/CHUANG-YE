import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  platform?: string;
  brandId?: string;
  details?: string;
  status: 'success' | 'failed' | 'pending' | 'warning';
  screenshot?: string;
  metadata?: Record<string, any>;
}

const LOG_DIR = path.join(process.cwd(), 'logs');

export class ActionLogger {
  private logFile: string;
  private jsonLogFile: string;

  constructor() {
    // Ensure log directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    
    // Set up log files with date
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(LOG_DIR, `dave-${date}.log`);
    this.jsonLogFile = path.join(LOG_DIR, `dave-${date}.json`);
  }

  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    const fullEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry
    };
    
    // Write to console
    this.consoleLog(fullEntry);
    
    // Write to file
    this.writeToFile(fullEntry);
    
    // Write to database
    await this.writeToDatabase(fullEntry);
  }

  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.toISOString()}]`;
    const statusIcon = this.getStatusIcon(entry.status);
    const platform = entry.platform ? `[${entry.platform}]` : '';
    
    switch (entry.status) {
      case 'success':
        console.log(`${prefix} ${statusIcon} ${entry.action} ${platform} ${entry.details || ''}`);
        break;
      case 'failed':
        console.error(`${prefix} ${statusIcon} ${entry.action} ${platform} ${entry.details || ''}`);
        break;
      case 'warning':
        console.warn(`${prefix} ${statusIcon} ${entry.action} ${platform} ${entry.details || ''}`);
        break;
      default:
        console.log(`${prefix} ${statusIcon} ${entry.action} ${platform} ${entry.details || ''}`);
    }
  }

  private writeToFile(entry: LogEntry): void {
    try {
      // Plain text log
      const textLine = `[${entry.timestamp.toISOString()}] [${entry.status.toUpperCase()}] ${entry.action} ${entry.platform || ''} ${entry.details || ''}\n`;
      fs.appendFileSync(this.logFile, textLine);
      
      // JSON log
      const jsonLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.jsonLogFile, jsonLine);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async writeToDatabase(entry: LogEntry): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          action: entry.action,
          platform: entry.platform,
          brandId: entry.brandId,
          details: entry.details,
          status: entry.status,
          screenshot: entry.screenshot,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null
        }
      });
    } catch (error) {
      // Don't log database errors to avoid infinite loop
      console.error('Failed to write to database:', error);
    }
  }

  async logPost(brandId: string, platform: string, status: string, details?: string): Promise<void> {
    await this.log({
      action: 'post',
      platform,
      brandId,
      details,
      status: status === 'posted' ? 'success' : status === 'failed' ? 'failed' : 'pending'
    });
  }

  async logEngagement(brandId: string, platform: string, type: string, target: string): Promise<void> {
    await this.log({
      action: 'engagement',
      platform,
      brandId,
      details: `${type} on ${target}`,
      status: 'success'
    });
  }

  async logDM(brandId: string, platform: string, userHandle: string, action: string): Promise<void> {
    await this.log({
      action: 'dm',
      platform,
      brandId,
      details: `${action} with ${userHandle}`,
      status: 'success'
    });
  }

  async logError(action: string, error: Error, context?: Record<string, any>): Promise<void> {
    await this.log({
      action,
      details: error.message,
      status: 'failed',
      metadata: {
        ...context,
        stack: error.stack
      }
    });
  }

  async logLogin(platform: string, username: string, success: boolean): Promise<void> {
    await this.log({
      action: 'login',
      platform,
      details: username,
      status: success ? 'success' : 'failed'
    });
  }

  async logImageGeneration(type: string, success: boolean, path?: string): Promise<void> {
    await this.log({
      action: 'image_generation',
      details: `Type: ${type}, Path: ${path || 'N/A'}`,
      status: success ? 'success' : 'failed'
    });
  }

  async logScheduler(action: string, details: string): Promise<void> {
    await this.log({
      action: 'scheduler',
      details: `${action}: ${details}`,
      status: 'success'
    });
  }

  async getRecentLogs(limit: number = 50): Promise<LogEntry[]> {
    try {
      const logs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        platform: log.platform || undefined,
        brandId: log.brandId || undefined,
        details: log.details || undefined,
        status: log.status as any,
        screenshot: log.screenshot || undefined,
        metadata: log.metadata ? JSON.parse(log.metadata as string) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  async getLogsByPlatform(platform: string, limit: number = 50): Promise<LogEntry[]> {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { platform },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        platform: log.platform || undefined,
        brandId: log.brandId || undefined,
        details: log.details || undefined,
        status: log.status as any
      }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  async getLogsByAction(action: string, limit: number = 50): Promise<LogEntry[]> {
    try {
      const logs = await prisma.activityLog.findMany({
        where: { action },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return logs.map(log => ({
        id: log.id,
        timestamp: log.createdAt,
        action: log.action,
        platform: log.platform || undefined,
        brandId: log.brandId || undefined,
        details: log.details || undefined,
        status: log.status as any
      }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  async getErrorLogs(limit: number = 50): Promise<LogEntry[]> {
    return this.getLogsByAction('error', limit);
  }

  async clearOldLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    
    console.log(`Cleared ${result.count} old log entries`);
    return result.count;
  }

  async getLogStats(): Promise<Record<string, number>> {
    const stats = await prisma.activityLog.groupBy({
      by: ['status'],
      _count: true
    });
    
    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {} as Record<string, number>);
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  getLogFilePath(): string {
    return this.logFile;
  }

  getJsonLogFilePath(): string {
    return this.jsonLogFile;
  }
}

// Singleton instance
let actionLoggerInstance: ActionLogger | null = null;

export function getActionLogger(): ActionLogger {
  if (!actionLoggerInstance) {
    actionLoggerInstance = new ActionLogger();
  }
  return actionLoggerInstance;
}

export async function logAction(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
  const logger = getActionLogger();
  await logger.log(entry);
}
