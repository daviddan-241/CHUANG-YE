/**
 * Telegram Manager — real user client via GramJS
 * Supports phone-number login, group management, and messaging
 */
import { PrismaClient } from '@prisma/client';
import {
  sendTelegramMessage,
  hasTelegramSession,
  getTelegramClient,
} from '@/lib/telegram/client';
import { generateDMReply } from '@/lib/ai/groq-client';

const prisma = new PrismaClient();

export interface TelegramGroup {
  id: string;
  name: string;
  url: string;          // @username or numeric chat id
  memberCount: number;
  isActive: boolean;
  autoPost: boolean;
  autoReply: boolean;
  welcomeMessage: string;
  pinnedMessage: string;
  contentTopics: string[];
  postingSchedule: string[];
}

export interface TelegramCommand {
  command: string;
  description: string;
  autoResponse: string;
}

const DEFAULT_COMMANDS: TelegramCommand[] = [
  {
    command: '/start',
    description: 'Welcome message',
    autoResponse:
      '👋 你好！我是创业导师 ChuangYe。\n\n每天分享：\n• 被动收入方法\n• AI工具\n• 自动化\n• 跨境商业\n\n发 /guide 获取免费资料包！',
  },
  {
    command: '/guide',
    description: 'Get free guide',
    autoResponse: '📚 这是你的免费资料包：\n\n{link}\n\n包含：\n✅ 50+ 供应商资源\n✅ 视频教程\n✅ 利润计算器\n✅ 营销模板\n\n祝你成功！🎉',
  },
  {
    command: '/tips',
    description: 'Daily business tip',
    autoResponse: '', // AI-generated dynamically
  },
];

const TRIGGER_KEYWORDS = [
  '1', 'start', 'interested', 'help', 'info', 'guide', 'link', 'how',
  '求带', '怎么弄', '怎么学', '有教程吗', '想学', '带带我', '资料',
];

export class TelegramManager {
  private groups: Map<string, TelegramGroup> = new Map();
  private commands: TelegramCommand[] = DEFAULT_COMMANDS;

  async addGroup(config: Omit<TelegramGroup, 'id'>): Promise<TelegramGroup> {
    const group: TelegramGroup = { ...config, id: `tg-${Date.now()}` };
    this.groups.set(group.id, group);
    return group;
  }

  async removeGroup(groupId: string): Promise<boolean> {
    return this.groups.delete(groupId);
  }

  async getGroups(): Promise<TelegramGroup[]> {
    return Array.from(this.groups.values());
  }

  /**
   * Send message using real GramJS user session or bot fallback
   */
  async sendMessage(brandId: string, target: string, message: string): Promise<boolean> {
    // Try real user session first
    if (await hasTelegramSession(brandId)) {
      return sendTelegramMessage(brandId, target, message);
    }

    // Fall back to Bot API if token available
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: target, text: message, parse_mode: 'HTML' }),
          }
        );
        return res.ok;
      } catch {
        return false;
      }
    }

    console.warn('No Telegram session or bot token configured');
    return false;
  }

  /**
   * Handle incoming DM — check for trigger keywords and auto-reply with AI
   */
  async handleIncomingDM(
    brandId: string,
    senderHandle: string,
    message: string,
    productLink: string = 'https://t.me/chuangye_official',
    brandPersona: string = 'ChuangYe'
  ): Promise<boolean> {
    const lower = message.toLowerCase();
    const isTriggered = TRIGGER_KEYWORDS.some((kw) => lower.includes(kw));
    if (!isTriggered) return false;

    // Detect language
    const hasChinese = /[\u4E00-\u9FFF]/.test(message);

    try {
      const reply = await generateDMReply({
        incomingMessage: message,
        brandPersona,
        productLink,
        language: hasChinese ? 'zh' : 'en',
      });

      // Log to DB
      await prisma.dM.create({
        data: {
          brandId,
          platform: 'telegram',
          userHandle: senderHandle,
          message,
          reply,
          status: 'replied',
          triggerWord: TRIGGER_KEYWORDS.find((kw) => lower.includes(kw)) || '',
          sentAt: new Date(),
        },
      });

      return sendTelegramMessage(brandId, senderHandle, reply);
    } catch (err) {
      console.error('DM auto-reply error:', err);
      return false;
    }
  }

  /**
   * Post to all active groups for a brand
   */
  async broadcastToGroups(brandId: string, message: string): Promise<void> {
    const activeGroups = Array.from(this.groups.values()).filter(
      (g) => g.isActive && g.autoPost
    );

    for (const group of activeGroups) {
      const ok = await this.sendMessage(brandId, group.url, message);
      console.log(`${ok ? '✅' : '❌'} Broadcast to ${group.name}`);
      // Small delay between groups to avoid rate limits
      await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000));
    }
  }

  /**
   * Get real group/channel info via GramJS
   */
  async getGroupInfo(brandId: string, target: string): Promise<{ title: string; memberCount: number } | null> {
    try {
      const client = await getTelegramClient(brandId);
      const entity = await client.getEntity(target);
      await client.disconnect();
      return {
        title: (entity as any).title || (entity as any).username || target,
        memberCount: (entity as any).participantsCount || 0,
      };
    } catch {
      return null;
    }
  }

  getCommands(): TelegramCommand[] {
    return this.commands;
  }

  addCommand(command: TelegramCommand): void {
    this.commands.push(command);
  }
}

let telegramManagerInstance: TelegramManager | null = null;

export function getTelegramManager(): TelegramManager {
  if (!telegramManagerInstance) {
    telegramManagerInstance = new TelegramManager();
  }
  return telegramManagerInstance;
}
