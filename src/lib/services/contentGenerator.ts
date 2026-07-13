import { v4 as uuidv4 } from 'uuid';

export interface ContentRequest {
  topic: string;
  platform: string;
  style?: 'professional' | 'casual' | 'engaging' | 'informative' | 'motivational';
  tone?: 'formal' | 'conversational' | 'enthusiastic' | 'authoritative' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  targetAudience?: string;
  callToAction?: string;
  referencePosts?: string[];
}

export interface GeneratedContent {
  id: string;
  content: string;
  hashtags: string[];
  imagePrompt: string;
  metadata: {
    platform: string;
    style: string;
    tone: string;
    wordCount: number;
    readingTime: number;
  };
}

const PLATFORM_LIMITS: Record<string, { maxLength: number; hashtagLimit: number }> = {
  twitter: { maxLength: 280, hashtagLimit: 5 },
  instagram: { maxLength: 2200, hashtagLimit: 30 },
  facebook: { maxLength: 63206, hashtagLimit: 10 },
  linkedin: { maxLength: 3000, hashtagLimit: 5 },
  telegram: { maxLength: 4096, hashtagLimit: 10 },
  xiaohongshu: { maxLength: 1000, hashtagLimit: 10 },
  wechat: { maxLength: 2000, hashtagLimit: 5 },
  douyin: { maxLength: 500, hashtagLimit: 5 },
};

const STYLE_TEMPLATES: Record<string, string[]> = {
  professional: [
    'As a seasoned professional with over 18 years of experience,',
    'Drawing from my MBA at INSEAD and extensive industry knowledge,',
    'In my experience leading multiple ventures,',
  ],
  casual: [
    'Hey everyone! 👋',
    'Just had an interesting thought...',
    'So I was thinking about this the other day...',
  ],
  engaging: [
    '🚀 Exciting news!',
    '💡 Here\'s something that blew my mind:',
    '🔥 Hot take incoming!',
  ],
  informative: [
    '📊 Key insight:',
    '📚 Did you know that',
    '🎯 Here\'s what the data shows:',
  ],
  motivational: [
    '💪 Remember this:',
    '🌟 Success tip:',
    '⚡ The secret to growth:',
  ],
};

const EMOJI_SETS: Record<string, string[]> = {
  professional: ['📊', '📈', '💼', '🎯', '✅', '🔑', '💡', '🚀'],
  casual: ['😊', '🤔', '👀', '🙌', '💪', '🔥', '✨', '🎉'],
  engaging: ['🚀', '🔥', '💥', '⚡', '🎯', '💯', '🙌', '✨'],
  informative: ['📊', '📈', '📋', '🔍', '💡', '📌', '✅', '🎯'],
  motivational: ['💪', '🌟', '🔥', '⚡', '🎯', '💯', '🙌', '✨'],
};

export class ContentGenerator {
  private learnedStyle: {
    tone: string;
    vocabulary: string[];
    emojiUsage: string[];
    sentenceStructure: string;
  } | null = null;

  constructor() {
    // Initialize with default style
    this.learnedStyle = null;
  }

  async generate(request: ContentRequest): Promise<GeneratedContent> {
    const platform = request.platform.toLowerCase();
    const style = request.style || 'professional';
    const tone = request.tone || 'authoritative';
    const length = request.length || 'medium';
    
    // Get platform limits
    const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.twitter;
    
    // Generate content based on style and tone
    let content = await this.createContent(request, style, tone, length);
    
    // Trim to platform limits
    if (content.length > limits.maxLength) {
      content = this.trimContent(content, limits.maxLength);
    }
    
    // Generate hashtags
    const hashtags = request.includeHashtags !== false
      ? this.generateHashtags(request.topic, platform, limits.hashtagLimit)
      : [];
    
    // Add hashtags to content if platform supports it
    if (hashtags.length > 0 && platform !== 'telegram') {
      content += '\n\n' + hashtags.join(' ');
    }
    
    // Generate image prompt
    const imagePrompt = this.generateImagePrompt(request.topic, style, platform);
    
    return {
      id: uuidv4(),
      content,
      hashtags,
      imagePrompt,
      metadata: {
        platform,
        style,
        tone,
        wordCount: content.split(/\s+/).length,
        readingTime: Math.ceil(content.split(/\s+/).length / 200),
      },
    };
  }

  private async createContent(
    request: ContentRequest,
    style: string,
    tone: string,
    length: string
  ): Promise<string> {
    const topic = request.topic;
    const platform = request.platform.toLowerCase();
    
    // Get style-specific opener
    const openers = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.professional;
    const opener = openers[Math.floor(Math.random() * openers.length)];
    
    // Get emojis if requested
    let emojis: string[] = [];
    if (request.includeEmojis !== false) {
      const emojiSet = EMOJI_SETS[style] || EMOJI_SETS.professional;
      emojis = this.selectRandomEmojis(emojiSet, 3);
    }
    
    // Build content sections
    const sections: string[] = [];
    
    // Opening hook
    sections.push(`${opener} ${emojis[0] || ''}`);
    
    // Main content based on topic
    sections.push(this.generateMainContent(topic, style, tone));
    
    // Key points
    if (length !== 'short') {
      sections.push(this.generateKeyPoints(topic, style));
    }
    
    // Call to action
    if (request.callToAction) {
      sections.push(request.callToAction);
    } else {
      sections.push(this.generateCallToAction(style));
    }
    
    // Closing
    sections.push(this.generateClosing(style, emojis));
    
    // Join sections
    let content = sections.filter(s => s.trim()).join('\n\n');
    
    // Apply learned style if available
    if (this.learnedStyle) {
      content = this.applyLearnedStyle(content);
    }
    
    return content;
  }

  private generateMainContent(topic: string, style: string, tone: string): string {
    const contentTemplates: Record<string, string[]> = {
      professional: [
        `The landscape of ${topic} is evolving rapidly. Based on my analysis and industry experience, here are the key developments that are shaping the future.`,
        `After extensive research and hands-on experience with ${topic}, I've identified several critical factors that professionals need to understand.`,
        `${topic} represents a fundamental shift in how we approach modern challenges. Let me break down the essential insights.`,
      ],
      casual: [
        `So I've been diving deep into ${topic} lately, and honestly? It's mind-blowing. Here's what I've learned.`,
        `Okay, let's talk about ${topic} for a sec. This stuff is seriously cool and here's why you should care.`,
        `I've been geeking out over ${topic} and I had to share what I found. Trust me, this is worth your time.`,
      ],
      engaging: [
        `🔥 ${topic} is absolutely transforming the game right now! Here's what you need to know to stay ahead.`,
        `⚡ Buckle up, because ${topic} is about to change everything. Here's the inside scoop!`,
        `🚀 The ${topic} revolution is here, and it's moving FAST. Let me show you what's happening!`,
      ],
      informative: [
        `📊 New research on ${topic} reveals surprising trends that could impact your strategy. Here's the breakdown.`,
        `📚 Understanding ${topic} is crucial in today's landscape. Let me share the key data points and insights.`,
        `🔍 After analyzing the latest developments in ${topic}, here are the facts you need to know.`,
      ],
      motivational: [
        `💪 Mastering ${topic} isn't just about knowledge—it's about mindset. Here's how to approach it like a champion.`,
        `🌟 Success in ${topic} requires both strategy and determination. Let me share what separates the winners from the rest.`,
        `⚡ The journey to excellence in ${topic} starts with a single step. Here's your roadmap to success.`,
      ],
    };
    
    const templates = contentTemplates[style] || contentTemplates.professional;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateKeyPoints(topic: string, style: string): string {
    const points = [
      `• Innovation in ${topic} is accelerating at unprecedented rates`,
      `• Early adopters are seeing 3-5x better results than competitors`,
      `• The key is to start small, measure everything, and iterate quickly`,
      `• Building a strong foundation now will pay dividends for years to come`,
    ];
    
    // Select 2-4 points
    const count = Math.floor(Math.random() * 3) + 2;
    const selectedPoints = points.slice(0, count);
    
    return selectedPoints.join('\n');
  }

  private generateCallToAction(style: string): string {
    const ctas: Record<string, string[]> = {
      professional: [
        'What are your thoughts on this? I\'d love to hear your perspective in the comments.',
        'Feel free to share your experiences or reach out if you\'d like to discuss further.',
        'Let\'s connect and explore how we can leverage these insights together.',
      ],
      casual: [
        'What do you think? Drop your thoughts below! 👇',
        'Anyone else been exploring this? Let me know!',
        'Tag someone who needs to see this! 🏷️',
      ],
      engaging: [
        'What\'s YOUR take on this? Let me know in the comments! 💬',
        'Share this with someone who needs to hear it! 🔄',
        'Double tap if you agree! ❤️',
      ],
      informative: [
        'Save this post for later reference. 📌',
        'Share your data points or questions in the comments.',
        'Follow for more insights like this. 🔔',
      ],
      motivational: [
        'You\'ve got this! Share your journey with us. 💪',
        'Tag someone who inspires you! 🌟',
        'Let\'s grow together! Follow for daily motivation. 🚀',
      ],
    };
    
    const styleCtas = ctas[style] || ctas.professional;
    return styleCtas[Math.floor(Math.random() * styleCtas.length)];
  }

  private generateClosing(style: string, emojis: string[]): string {
    const closings: Record<string, string[]> = {
      professional: [
        'Looking forward to the discussion.',
        'Best regards,',
        'To your success,',
      ],
      casual: [
        'Catch you later! ✌️',
        'Until next time! 👋',
        'Peace out! 🤙',
      ],
      engaging: [
        'Stay tuned for more! 🔔',
        'More coming soon! 🚀',
        'Follow for updates! ✨',
      ],
      informative: [
        'Hope this helps!',
        'Questions? Ask away!',
        'More data coming soon.',
      ],
      motivational: [
        'Keep pushing forward! 💪',
        'Believe in yourself! 🌟',
        'The best is yet to come! 🚀',
      ],
    };
    
    const styleClosings = closings[style] || closings.professional;
    const closing = styleClosings[Math.floor(Math.random() * styleClosings.length)];
    
    return `${closing} ${emojis[2] || ''}`;
  }

  private generateHashtags(topic: string, platform: string, limit: number): string[] {
    const baseHashtags = [
      `#${topic.replace(/\s+/g, '')}`,
      `#${topic.split(' ')[0].toLowerCase()}`,
      '#Innovation',
      '#Growth',
      '#Success',
      '#Leadership',
      '#Strategy',
      '#Future',
      '#Technology',
      '#Business',
      '#AI',
      '#DigitalTransformation',
      '#Entrepreneurship',
      '#Marketing',
      '#Productivity',
    ];
    
    // Platform-specific hashtags
    const platformHashtags: Record<string, string[]> = {
      twitter: ['#TwitterTips', '#ContentCreator', '#SocialMedia'],
      instagram: ['#InstaGood', '#PhotoOfTheDay', '#Explore', '#Reels'],
      linkedin: ['#Professional', '#Career', '#Networking', '#B2B'],
      xiaohongshu: ['#小红书', '#分享', '#生活', '#学习'],
    };
    
    const allHashtags = [
      ...baseHashtags,
      ...(platformHashtags[platform] || []),
    ];
    
    // Shuffle and select
    const shuffled = allHashtags.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(limit, shuffled.length));
  }

  private generateImagePrompt(topic: string, style: string, platform: string): string {
    const stylePrompts: Record<string, string> = {
      professional: 'Professional business setting, corporate environment, modern office',
      casual: 'Relaxed setting, natural lighting, lifestyle photo',
      engaging: 'Dynamic composition, vibrant colors, eye-catching',
      informative: 'Clean design, data visualization, infographic style',
      motivational: 'Inspiring scene, upward perspective, dramatic lighting',
    };
    
    const stylePrompt = stylePrompts[style] || stylePrompts.professional;
    
    return `Photorealistic, ${stylePrompt}, related to ${topic}, high quality, 8K, professional photography, social media ready, ${platform} optimized`;
  }

  private selectRandomEmojis(emojis: string[], count: number): string[] {
    const shuffled = [...emojis].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private trimContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) {
      return content;
    }
    
    // Try to trim at sentence boundary
    const sentences = content.split(/(?<=[.!?])\s+/);
    let trimmed = '';
    
    for (const sentence of sentences) {
      if ((trimmed + ' ' + sentence).length <= maxLength - 3) {
        trimmed += (trimmed ? ' ' : '') + sentence;
      } else {
        break;
      }
    }
    
    if (trimmed.length < maxLength * 0.8) {
      // If trimmed too much, just cut at word boundary
      trimmed = content.substring(0, maxLength - 3);
      const lastSpace = trimmed.lastIndexOf(' ');
      if (lastSpace > 0) {
        trimmed = trimmed.substring(0, lastSpace);
      }
    }
    
    return trimmed + '...';
  }

  private applyLearnedStyle(content: string): string {
    if (!this.learnedStyle) {
      return content;
    }
    
    // Apply learned vocabulary
    // This is a simplified implementation
    // In production, you'd use more sophisticated NLP
    
    return content;
  }

  async learnStyle(examplePosts: string[]): Promise<void> {
    // Analyze example posts to learn writing style
    const allText = examplePosts.join(' ');
    
    // Extract common patterns
    const words = allText.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord.length > 3) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
      }
    });
    
    // Get top vocabulary words
    const vocabulary = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word]) => word);
    
    // Detect emoji usage
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/gu;
    const emojis = allText.match(emojiRegex) || [];
    const uniqueEmojis = [...new Set(emojis)];
    
    // Detect tone
    const formalWords = ['furthermore', 'consequently', 'therefore', 'moreover', 'additionally'];
    const casualWords = ['hey', 'gonna', 'wanna', 'gotta', 'kinda'];
    
    const formalCount = formalWords.filter(w => allText.toLowerCase().includes(w)).length;
    const casualCount = casualWords.filter(w => allText.toLowerCase().includes(w)).length;
    
    this.learnedStyle = {
      tone: formalCount > casualCount ? 'formal' : 'casual',
      vocabulary: vocabulary.slice(0, 20),
      emojiUsage: uniqueEmojis.slice(0, 10),
      sentenceStructure: 'varied',
    };
    
    console.log('Style learned:', this.learnedStyle);
  }

  getLearnedStyle() {
    return this.learnedStyle;
  }
}

// Singleton instance
let contentGeneratorInstance: ContentGenerator | null = null;

export function getContentGenerator(): ContentGenerator {
  if (!contentGeneratorInstance) {
    contentGeneratorInstance = new ContentGenerator();
  }
  return contentGeneratorInstance;
}
