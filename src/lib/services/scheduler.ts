import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ScheduledJob {
  id: string;
  type: 'post' | 'reply' | 'engagement' | 'maintenance';
  platform: string;
  accountId: string;
  payload: any;
  scheduledAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
  error?: string;
  createdAt: Date;
}

export interface SchedulerConfig {
  maxConcurrentJobs: number;
  defaultRetryCount: number;
  retryDelay: number; // milliseconds
  checkInterval: number; // milliseconds
}

const DEFAULT_CONFIG: SchedulerConfig = {
  maxConcurrentJobs: 3,
  defaultRetryCount: 3,
  retryDelay: 60000, // 1 minute
  checkInterval: 30000, // 30 seconds
};

export class JobScheduler extends EventEmitter {
  private jobs: Map<string, ScheduledJob> = new Map();
  private runningJobs: Set<string> = new Set();
  private config: SchedulerConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(config: Partial<SchedulerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  start(): void {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    this.checkInterval = setInterval(() => this.checkJobs(), this.config.checkInterval);
    
    console.log('Job scheduler started');
    this.emit('started');
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    console.log('Job scheduler stopped');
    this.emit('stopped');
  }

  addJob(job: Omit<ScheduledJob, 'id' | 'status' | 'retryCount' | 'createdAt'>): ScheduledJob {
    const newJob: ScheduledJob = {
      ...job,
      id: uuidv4(),
      status: 'pending',
      retryCount: 0,
      maxRetries: job.maxRetries || this.config.defaultRetryCount,
      createdAt: new Date(),
    };

    this.jobs.set(newJob.id, newJob);
    
    console.log(`Job scheduled: ${newJob.id} - ${newJob.type} at ${newJob.scheduledAt}`);
    this.emit('jobAdded', newJob);
    
    return newJob;
  }

  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    
    if (!job) {
      return false;
    }

    if (job.status === 'pending') {
      job.status = 'cancelled';
      this.jobs.set(jobId, job);
      this.emit('jobCancelled', job);
      return true;
    }

    return false;
  }

  removeJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    
    if (!job || job.status === 'running') {
      return false;
    }

    this.jobs.delete(jobId);
    this.emit('jobRemoved', jobId);
    return true;
  }

  private async checkJobs(): Promise<void> {
    const now = new Date();
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status !== 'pending') {
        continue;
      }

      if (job.scheduledAt <= now) {
        if (this.runningJobs.size < this.config.maxConcurrentJobs) {
          await this.executeJob(job);
        }
      }
    }
  }

  private async executeJob(job: ScheduledJob): Promise<void> {
    try {
      // Mark as running
      job.status = 'running';
      job.startedAt = new Date();
      this.jobs.set(job.id, job);
      this.runningJobs.add(job.id);
      
      this.emit('jobStarted', job);
      console.log(`Executing job: ${job.id} - ${job.type}`);

      // Execute based on job type
      let success = false;
      
      switch (job.type) {
        case 'post':
          success = await this.executePostJob(job);
          break;
        case 'reply':
          success = await this.executeReplyJob(job);
          break;
        case 'engagement':
          success = await this.executeEngagementJob(job);
          break;
        case 'maintenance':
          success = await this.executeMaintenanceJob(job);
          break;
        default:
          console.error(`Unknown job type: ${job.type}`);
          success = false;
      }

      // Update job status
      job.completedAt = new Date();
      job.status = success ? 'completed' : 'failed';
      this.jobs.set(job.id, job);
      this.runningJobs.delete(job.id);
      
      this.emit(success ? 'jobCompleted' : 'jobFailed', job);
      console.log(`Job ${job.id} ${success ? 'completed' : 'failed'}`);
      
    } catch (error) {
      console.error(`Job ${job.id} failed with error:`, error);
      
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.jobs.set(job.id, job);
      this.runningJobs.delete(job.id);
      
      // Retry if possible
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        job.status = 'pending';
        job.scheduledAt = new Date(Date.now() + this.config.retryDelay * job.retryCount);
        job.error = undefined;
        this.jobs.set(job.id, job);
        
        console.log(`Job ${job.id} scheduled for retry ${job.retryCount}/${job.maxRetries}`);
        this.emit('jobRetry', job);
      } else {
        this.emit('jobFailed', job);
      }
    }
  }

  private async executePostJob(job: ScheduledJob): Promise<boolean> {
    // This would integrate with the platform-specific automation
    console.log('Executing post job:', job.payload);
    
    // Simulate post execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  }

  private async executeReplyJob(job: ScheduledJob): Promise<boolean> {
    console.log('Executing reply job:', job.payload);
    
    // Simulate reply execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  private async executeEngagementJob(job: ScheduledJob): Promise<boolean> {
    console.log('Executing engagement job:', job.payload);
    
    // Simulate engagement actions
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return true;
  }

  private async executeMaintenanceJob(job: ScheduledJob): Promise<boolean> {
    console.log('Executing maintenance job:', job.payload);
    
    // Simulate maintenance tasks
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  getJobsByStatus(status: ScheduledJob['status']): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  getJobsByPlatform(platform: string): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter(job => job.platform === platform);
  }

  getJobsByAccount(accountId: string): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter(job => job.accountId === accountId);
  }

  clearCompletedJobs(): number {
    let count = 0;
    
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'cancelled') {
        this.jobs.delete(jobId);
        count++;
      }
    }
    
    return count;
  }

  getStats(): {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  } {
    const jobs = Array.from(this.jobs.values());
    
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      running: jobs.filter(j => j.status === 'running').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      cancelled: jobs.filter(j => j.status === 'cancelled').length,
    };
  }

  schedulePost(
    platform: string,
    accountId: string,
    content: string,
    scheduledAt: Date,
    options: { images?: string[]; maxRetries?: number } = {}
  ): ScheduledJob {
    return this.addJob({
      type: 'post',
      platform,
      accountId,
      payload: {
        content,
        images: options.images,
      },
      scheduledAt,
      maxRetries: options.maxRetries || this.config.defaultRetryCount,
    });
  }

  scheduleEngagement(
    platform: string,
    accountId: string,
    actions: string[],
    scheduledAt: Date
  ): ScheduledJob {
    return this.addJob({
      type: 'engagement',
      platform,
      accountId,
      payload: {
        actions,
      },
      scheduledAt,
      maxRetries: this.config.defaultRetryCount,
    });
  }

  scheduleRecurringPost(
    platform: string,
    accountId: string,
    contentGenerator: () => Promise<string>,
    intervalHours: number,
    startDate: Date
  ): ScheduledJob[] {
    const jobs: ScheduledJob[] = [];
    const now = new Date();
    
    // Schedule posts for the next 7 days
    for (let i = 0; i < 7 * (24 / intervalHours); i++) {
      const scheduledAt = new Date(startDate.getTime() + i * intervalHours * 60 * 60 * 1000);
      
      if (scheduledAt > now) {
        const job = this.addJob({
          type: 'post',
          platform,
          accountId,
          payload: {
            contentGenerator: contentGenerator.toString(),
            isRecurring: true,
          },
          scheduledAt,
          maxRetries: this.config.defaultRetryCount,
        });
        
        jobs.push(job);
      }
    }
    
    return jobs;
  }
}

// Singleton instance
let schedulerInstance: JobScheduler | null = null;

export function getScheduler(config?: Partial<SchedulerConfig>): JobScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new JobScheduler(config);
  }
  return schedulerInstance;
}
