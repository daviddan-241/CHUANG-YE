/**
 * Content Generator — powered by free Groq AI (llama-3.3-70b)
 * Replaces template-only generation with real LLM calls
 */
import { v4 as uuidv4 } from 'uuid';
import { generateSocialPost, generateHashtags } from '@/lib/ai/groq-client';

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
  language?: 'en' | 'zh' | 'bilingual';
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
    aiPowered: boolean;
  };
}

const PLATFORM_LIMITS: Record<string, { maxLength: number; hashtagLimit: number }> = {
  twitter: { maxLength: 280, hashtagLimit: 3 },
  instagram: { maxLength: 2200, hashtagLimit: 30 },
  facebook: { maxLength: 63206, hashtagLimit: 10 },
  linkedin: { maxLength: 3000, hashtagLimit: 5 },
  telegram: { maxLength: 4096, hashtagLimit: 5 },
  xiaohongshu: { maxLength: 1000, hashtagLimit: 10 },
  wechat: { maxLength: 2000, hashtagLimit: 5 },
  douyin: { maxLength: 500, hashtagLimit: 5 },
};

export class ContentGenerator {
  private learnedStyle: { tone: string; vocabulary: string[]; emojiUsage: string[] } | null = null;

  async generate(request: ContentRequest): Promise<GeneratedContent> {
    const platform = request.platform.toLowerCase();
    const style = request.style || 'professional';
    const tone = request.tone || 'authoritative';
    const length = request.length || 'medium';
    const limits = PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.twitter;

    // Detect language preference — default Chinese for ChuangYe
    const language = request.language ?? (
      request.targetAudience?.toLowerCase().includes('chin') ? 'zh' : 'bilingual'
    );

    // Real AI generation via Groq
    let content = await generateSocialPost({
      topic: request.topic,
      platform,
      style,
      tone,
      length,
      language,
      cta: request.callToAction,
      audience: request.targetAudience,
    });

    // Trim to platform limit
    if (content.length > limits.maxLength) {
      content = content.slice(0, limits.maxLength - 3) + '...';
    }

    // Generate hashtags if requested
    const hashtags =
      request.includeHashtags !== false
        ? await generateHashtags(request.topic, platform, limits.hashtagLimit)
        : [];

    // Append hashtags (not for WeChat/Telegram)
    if (hashtags.length > 0 && !['telegram', 'wechat'].includes(platform)) {
      content += '\n\n' + hashtags.join(' ');
    }

    const imagePrompt = this.buildImagePrompt(request.topic, style, platform);
    const wordCount = content.split(/\s+/).length;

    return {
      id: uuidv4(),
      content,
      hashtags,
      imagePrompt,
      metadata: {
        platform,
        style,
        tone,
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        aiPowered: true,
      },
    };
  }

  private buildImagePrompt(topic: string, style: string, platform: string): string {
    const styleMap: Record<string, string> = {
      professional: 'professional corporate photography, clean modern office, confident expression',
      casual: 'lifestyle photography, natural light, authentic moment, candid',
      motivational: 'cinematic portrait, golden hour lighting, determined expression, aspirational',
      engaging: 'vibrant colors, dynamic composition, eye-catching, social media optimized',
      informative: 'clean infographic style, data visualization, professional layout',
    };
    return `Asian entrepreneur, ${topic}, ${styleMap[style] || styleMap.professional}, 8K, photorealistic, optimized for ${platform}`;
  }

  async learnFromPosts(posts: string[]): Promise<void> {
    // Style learning is now handled by AI context rather than manual keyword extraction
    const allText = posts.join(' ');
    this.learnedStyle = {
      tone: allText.match(/\b(therefore|moreover|consequently)\b/i) ? 'formal' : 'casual',
      vocabulary: [],
      emojiUsage: (allText.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).slice(0, 10),
    };
  }

  getLearnedStyle() {
    return this.learnedStyle;
  }
}

let contentGeneratorInstance: ContentGenerator | null = null;

export function getContentGenerator(): ContentGenerator {
  if (!contentGeneratorInstance) {
    contentGeneratorInstance = new ContentGenerator();
  }
  return contentGeneratorInstance;
}
