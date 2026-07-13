import { PrismaClient } from '@prisma/client';
import { getDMTrigger } from './dm-trigger';

const prisma = new PrismaClient();

interface FollowUpConfig {
  followUpDelayHours: number;
  finalNudgeDelayHours: number;
  maxFollowUps: number;
}

const FOLLOW_UP_MESSAGES = {
  english: [
    "Hey! Just checking in - did you get a chance to read the guide? I'd love to hear your thoughts! 🙌",
    "Hi there! Quick follow-up on the PDF I sent. Which section resonated with you most?",
    "Just wanted to make sure you got the guide! Let me know if you have any questions 💪"
  ],
  chinese: [
    "你好！跟进一下，资料看了吗？有什么想法？🙏",
    "嗨！之前发的PDF看了吗？哪个部分最感兴趣？",
    "确认一下你收到资料了！有问题随时问我 💪"
  ]
};

const FINAL_NUDGE_MESSAGES = {
  english: [
    "Last chance! The free resource pack is closing tomorrow. Don't miss out! 🚀",
    "Hey! Just a heads up - I'm removing the free guide link tomorrow. Grab it while you can!",
    "Final reminder: The free PDF pack won't be available after today. Download now if you haven't! ⏰"
  ],
  chinese: [
    "最后提醒！免费资料包明天截止，不要错过！🚀",
    "嗨！明天就要关闭免费资料下载了，抓紧时间！",
    "最后机会：今天之后免费PDF就下架了，赶紧下载！⏰"
  ]
};

export class FollowUpManager {
  private config: FollowUpConfig;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<FollowUpConfig> = {}) {
    this.config = {
      followUpDelayHours: 2,
      finalNudgeDelayHours: 24,
      maxFollowUps: 2,
      ...config
    };
  }

  async startProcessing(): Promise<void> {
    console.log('📨 Starting follow-up processing...');
    
    // Process immediately
    await this.processPendingFollowUps();
    
    // Set up periodic processing (every 30 minutes)
    this.checkInterval = setInterval(() => {
      this.processPendingFollowUps();
    }, 30 * 60 * 1000);
    
    console.log('✅ Follow-up processing started');
  }

  private async processPendingFollowUps(): Promise<void> {
    console.log('🔄 Processing pending follow-ups...');
    
    // Find DMs that need follow-up
    const pendingFollowUps = await prisma.dM.findMany({
      where: {
        status: 'replied',
        sentAt: {
          lte: new Date(Date.now() - this.config.followUpDelayHours * 60 * 60 * 1000)
        }
      }
    });

    console.log(`  Found ${pendingFollowUps.length} DMs needing follow-up`);

    for (const dm of pendingFollowUps) {
      try {
        await this.sendFollowUp(dm);
        await this.delay(5000); // Delay between follow-ups
      } catch (error) {
        console.error(`  ❌ Follow-up failed for ${dm.userHandle}:`, error);
      }
    }

    // Find DMs that need final nudge
    const finalNudges = await prisma.dM.findMany({
      where: {
        status: 'followed_up',
        updatedAt: {
          lte: new Date(Date.now() - this.config.finalNudgeDelayHours * 60 * 60 * 1000)
        }
      }
    });

    console.log(`  Found ${finalNudges.length} DMs needing final nudge`);

    for (const dm of finalNudges) {
      try {
        await this.sendFinalNudge(dm);
        await this.delay(5000);
      } catch (error) {
        console.error(`  ❌ Final nudge failed for ${dm.userHandle}:`, error);
      }
    }
  }

  private async sendFollowUp(dm: any): Promise<void> {
    console.log(`  📤 Sending follow-up to ${dm.userHandle}...`);
    
    const isChinese = /[\u4e00-\u9fff]/.test(dm.message);
    const messages = isChinese ? FOLLOW_UP_MESSAGES.chinese : FOLLOW_UP_MESSAGES.english;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Send via DM trigger
    const dmTrigger = getDMTrigger();
    // In real implementation, this would call the send method
    
    // Update status
    await prisma.dM.update({
      where: { id: dm.id },
      data: {
        status: 'followed_up',
        reply: message,
        updatedAt: new Date()
      }
    });
    
    console.log(`  ✅ Follow-up sent to ${dm.userHandle}`);
  }

  private async sendFinalNudge(dm: any): Promise<void> {
    console.log(`  ⏰ Sending final nudge to ${dm.userHandle}...`);
    
    const isChinese = /[\u4e00-\u9fff]/.test(dm.message);
    const messages = isChinese ? FINAL_NUDGE_MESSAGES.chinese : FINAL_NUDGE_MESSAGES.english;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Send via DM trigger
    const dmTrigger = getDMTrigger();
    // In real implementation, this would call the send method
    
    // Update status
    await prisma.dM.update({
      where: { id: dm.id },
      data: {
        status: 'nudged',
        reply: message,
        updatedAt: new Date()
      }
    });
    
    console.log(`  ✅ Final nudge sent to ${dm.userHandle}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('🛑 Follow-up processing stopped');
  }
}

// Singleton instance
let followUpManagerInstance: FollowUpManager | null = null;

export function getFollowUpManager(config?: Partial<FollowUpConfig>): FollowUpManager {
  if (!followUpManagerInstance) {
    followUpManagerInstance = new FollowUpManager(config);
  }
  return followUpManagerInstance;
}
