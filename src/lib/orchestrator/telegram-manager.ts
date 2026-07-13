import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TelegramGroup {
  id: string;
  name: string;
  url: string;
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
  handler: string;
  autoResponse: string;
}

const DEFAULT_COMMANDS: TelegramCommand[] = [
  {
    command: '/start',
    description: 'Welcome message',
    handler: 'sendWelcome',
    autoResponse: '👋 Welcome! I\'m ChuangYe, your AI business mentor.\n\nI share daily tips on:\n• Passive income\n• AI tools\n• Automation\n• Cross-border business\n\nType /help to see available commands!'
  },
  {
    command: '/help',
    description: 'Show commands',
    handler: 'sendHelp',
    autoResponse: '📋 Available Commands:\n\n/start - Welcome message\n/guide - Get free PDF guide\n/tips - Daily business tip\n/tools - Recommended AI tools\n/community - Join our community\n/support - Get support\n\nOr just ask me anything!'
  },
  {
    command: '/guide',
    description: 'Get free guide',
    handler: 'sendGuide',
    autoResponse: '📚 Here\'s your free guide!\n\nDownload: [LINK]\n\nThis contains:\n✅ 50+ supplier contacts\n✅ Video tutorials\n✅ Profit calculator\n✅ Marketing templates\n\nEnjoy! 🎉'
  },
  {
    command: '/tips',
    description: 'Daily tip',
    handler: 'sendTip',
    autoResponse: '' // Dynamic
  },
  {
    command: '/tools',
    description: 'AI tools list',
    handler: 'sendTools',
    autoResponse: '🤖 My Top AI Tools:\n\n1. ChatGPT - Content writing\n2. Midjourney - Image creation\n3. Opus Clip - Video editing\n4. Notion - Organization\n5. Zapier - Automation\n\nWhich one do you want to learn about?'
  }
];

export class TelegramManager {
  private groups: Map<string, TelegramGroup> = new Map();
  private commands: TelegramCommand[] = DEFAULT_COMMANDS;
  private botToken: string | null = null;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || null;
  }

  async addGroup(config: Omit<TelegramGroup, 'id'>): Promise<TelegramGroup> {
    const group: TelegramGroup = {
      ...config,
      id: `tg-${Date.now()}`
    };
    
    this.groups.set(group.id, group);
    
    // Save to database
    console.log(`✅ Added Telegram group: ${group.name}`);
    
    return group;
  }

  async removeGroup(groupId: string): Promise<boolean> {
    return this.groups.delete(groupId);
  }

  async getGroups(): Promise<TelegramGroup[]> {
    return Array.from(this.groups.values());
  }

  async sendMessage(groupId: string, message: string): Promise<boolean> {
    const group = this.groups.get(groupId);
    if (!group) return false;
    
    console.log(`📤 Sending to ${group.name}: ${message.substring(0, 50)}...`);
    
    // In production, this would use the Telegram Bot API
    if (this.botToken) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: group.url,
            text: message,
            parse_mode: 'HTML'
          })
        });
        
        return response.ok;
      } catch (error) {
        console.error('Failed to send Telegram message:', error);
        return false;
      }
    }
    
    return true;
  }

  async handleCommand(command: string, chatId: string, userId: string): Promise<string | null> {
    const cmd = this.commands.find(c => c.command === command);
    
    if (!cmd) return null;
    
    // Handle dynamic commands
    if (cmd.command === '/tips') {
      return this.getRandomTip();
    }
    
    return cmd.autoResponse;
  }

  private getRandomTip(): string {
    const tips = [
      '💡 Daily Tip: Start with one platform, master it, then expand. Don\'t try to be everywhere at once!',
      '💡 Daily Tip: Your first 100 followers are the hardest. Focus on engagement, not numbers.',
      '💡 Daily Tip: AI tools can 10x your productivity. Use them for content creation and scheduling.',
      '💡 Daily Tip: Consistency beats perfection. Post daily, even if it\'s not perfect.',
      '💡 Daily Tip: Build an email list from day 1. Social media algorithms change, but email doesn\'t.',
      '💡 Daily Tip: Solve one specific problem for one specific person. That\'s how you build a real business.',
      '💡 Daily Tip: Don\'t sell products. Sell transformations. People buy outcomes, not features.',
      '💡 Daily Tip: Automation is your friend. If you do something twice, automate it.',
      '💡 Daily Tip: Study your competitors, but don\'t copy them. Find what makes you unique.',
      '💡 Daily Tip: Revenue is vanity, profit is sanity, cash flow is reality. Focus on what matters.'
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  }

  async schedulePost(groupId: string, message: string, scheduledTime: Date): Promise<void> {
    console.log(`📅 Scheduled post for ${groupId} at ${scheduledTime}`);
    
    // In production, this would add to the scheduler
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(() => {
        this.sendMessage(groupId, message);
      }, delay);
    }
  }

  async autoReply(groupId: string, message: string, userId: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    
    // Keyword-based auto-replies
    const replies: Record<string, string> = {
      'hi': '👋 Hey! Welcome! How can I help you today?',
      'hello': '👋 Hi there! What brings you to our community?',
      'help': '🆘 I\'m here to help! Type /help to see available commands, or just ask me anything!',
      'guide': '📚 Here\'s the free guide: [LINK]\n\nLet me know if you have any questions!',
      '1': '📚 Great! Here\'s your free PDF guide: [LINK]\n\nEnjoy! 🎉',
      'start': '🚀 Ready to start your journey? Here\'s what to do:\n\n1. Download the free guide\n2. Watch the intro video\n3. Join our weekly Q&A\n\nType /guide to get started!',
      'thanks': '🙏 You\'re welcome! Let me know if you need anything else!',
      'thank you': '🙏 Happy to help! Feel free to ask anytime!',
      '求带': '🙏 好的！请查看置顶消息获取免费资料，有任何问题随时问我！',
      '怎么学': '📚 建议先看免费资料，然后参加我们的每周问答！',
      '有教程吗': '✅ 有的！请查看置顶消息获取完整教程！'
    };
    
    // Check for keyword matches
    for (const [keyword, reply] of Object.entries(replies)) {
      if (lowerMessage.includes(keyword)) {
        return reply;
      }
    }
    
    return null;
  }

  async pinMessage(groupId: string, messageId: string): Promise<boolean> {
    if (!this.botToken) return false;
    
    const group = this.groups.get(groupId);
    if (!group) return false;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/pinChatMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: group.url,
          message_id: messageId
        })
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  async setWelcomeMessage(groupId: string, message: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (group) {
      group.welcomeMessage = message;
      console.log(`✅ Updated welcome message for ${group.name}`);
    }
  }

  async setPinnedMessage(groupId: string, message: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (group) {
      group.pinnedMessage = message;
      console.log(`✅ Updated pinned message for ${group.name}`);
    }
  }

  getCommands(): TelegramCommand[] {
    return this.commands;
  }

  addCommand(command: TelegramCommand): void {
    this.commands.push(command);
  }
}

// Singleton instance
let telegramManagerInstance: TelegramManager | null = null;

export function getTelegramManager(): TelegramManager {
  if (!telegramManagerInstance) {
    telegramManagerInstance = new TelegramManager();
  }
  return telegramManagerInstance;
}
