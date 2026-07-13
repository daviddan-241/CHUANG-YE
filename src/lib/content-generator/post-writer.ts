/**
 * Post Writer — real AI posts via Groq (free, fast)
 * Generates hook posts, carousels, video scripts
 */
import { v4 as uuidv4 } from 'uuid';
import { groqChat } from '@/lib/ai/groq-client';

export interface PostVariation {
  id: string;
  text: string;
  imagePrompt: string;
  platform: string;
  type: 'hook' | 'carousel' | 'video_script';
  metadata: {
    cta: string;
    revenueNumber: string;
    painPoint: string;
    emojiCount: number;
    wordCount: number;
  };
}

const CTAS = [
  "DM '1'", "Comment 'START'", "Link in bio",
  "私信'1'", "评论'开始'", "点击链接", "Save this post",
  "Tag someone who needs this",
];

const PAIN_POINTS = [
  "no consistent income", "no time", "don't know where to start",
  "tried and failed before", "too much conflicting information",
  "没有方向", "缺乏资源", "害怕失败", "信息太多不知道怎么选",
];

export class PostWriter {
  async generatePostVariations(topic: string, angle: string, brand: string): Promise<PostVariation[]> {
    console.log(`✍️ Generating AI post variations for: ${topic}`);

    const [hookPost, carouselPost, videoScript] = await Promise.all([
      this.generateHookPost(topic, angle, brand),
      this.generateCarouselPost(topic, angle, brand),
      this.generateVideoScript(topic, angle, brand),
    ]);

    return [hookPost, carouselPost, videoScript];
  }

  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private async generateHookPost(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.randomItem(CTAS);
    const painPoint = this.randomItem(PAIN_POINTS);
    const revenue = `¥${(Math.floor(Math.random() * 4000) + 1000).toLocaleString()}`;

    const text = await groqChat([
      {
        role: 'system',
        content: `You are ${brand}, a successful Asian entrepreneur. Write a hook social media post.
Rules: under 280 chars for the hook line, max 3 emojis, sound authentic not salesy.
Pain point to address: ${painPoint}
Revenue proof to mention: ${revenue}/month
CTA to end with: ${cta}
Write in Simplified Chinese or bilingual (Chinese + English key phrases).`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}\nAngle: ${angle}\nWrite the full post now.`,
      },
    ], { model: 'llama-3.3-70b-versatile', temperature: 0.9, maxTokens: 400 });

    return {
      id: uuidv4(),
      text,
      imagePrompt: `Asian entrepreneur success story, ${topic}, professional lifestyle photography, Shanghai modern office, golden hour, 8K`,
      platform: 'twitter',
      type: 'hook',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint,
        emojiCount: (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
        wordCount: text.split(/\s+/).length,
      },
    };
  }

  private async generateCarouselPost(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.randomItem(CTAS);
    const revenue = `¥${(Math.floor(Math.random() * 3000) + 1500).toLocaleString()}`;

    const text = await groqChat([
      {
        role: 'system',
        content: `You are ${brand}. Write a 5-slide carousel post outline for Xiaohongshu/Instagram.
Format: Slide 1: [hook], Slide 2-4: [value points], Slide 5: [CTA].
Revenue to mention: ${revenue}/month. Max 3 emojis total.
Write in Simplified Chinese.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}\nAngle: ${angle}\nCTA: ${cta}`,
      },
    ], { model: 'llama-3.3-70b-versatile', temperature: 0.85, maxTokens: 500 });

    return {
      id: uuidv4(),
      text,
      imagePrompt: `Carousel infographic, ${topic}, clean modern design, Chinese text, professional layout, brand colors cyan and blue`,
      platform: 'instagram',
      type: 'carousel',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint: this.randomItem(PAIN_POINTS),
        emojiCount: (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
        wordCount: text.split(/\s+/).length,
      },
    };
  }

  private async generateVideoScript(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.randomItem(CTAS);
    const revenue = `¥${(Math.floor(Math.random() * 5000) + 2000).toLocaleString()}`;

    const text = await groqChat([
      {
        role: 'system',
        content: `You are ${brand}. Write a 30-second Douyin/TikTok video script.
Format: Hook (3s) | Problem (5s) | Solution (15s) | Result (5s) | CTA (2s).
Revenue: ${revenue}/month. Sound authentic, use Chinese.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}\nAngle: ${angle}\nCTA: ${cta}`,
      },
    ], { model: 'llama-3.3-70b-versatile', temperature: 0.85, maxTokens: 400 });

    return {
      id: uuidv4(),
      text,
      imagePrompt: `Video thumbnail, ${topic}, bold Chinese text overlay, cinematic, high contrast, Douyin style`,
      platform: 'douyin',
      type: 'video_script',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint: this.randomItem(PAIN_POINTS),
        emojiCount: (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length,
        wordCount: text.split(/\s+/).length,
      },
    };
  }
}

export async function generatePosts(topic: string, angle: string, brand: string): Promise<PostVariation[]> {
  const writer = new PostWriter();
  return writer.generatePostVariations(topic, angle, brand);
}
