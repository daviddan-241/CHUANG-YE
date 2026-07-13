import { v4 as uuidv4 } from 'uuid';

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

interface PostWriterConfig {
  openaiApiKey?: string;
  ollamaUrl?: string;
  useLocalLlm: boolean;
}

const CTAS = [
  "DM '1'",
  "Comment 'START'",
  "Link in bio",
  "私信'1'",
  "评论'开始'",
  "点击链接",
  "Swipe up",
  "Save this post",
  "Tag someone who needs this",
  "Share with a friend"
];

const PAIN_POINTS = [
  "no followers",
  "no time",
  "no skills",
  "no money to start",
  "don't know where to begin",
  "too complicated",
  "tried everything and failed",
  "scams everywhere",
  "信息太多不知道怎么选",
  "没有方向",
  "缺乏资源",
  "害怕失败"
];

const REVENUE_RANGES = {
  low: { min: 500, max: 1500 },
  mid: { min: 1500, max: 3000 },
  high: { min: 3000, max: 5000 }
};

export class PostWriter {
  private config: PostWriterConfig;

  constructor(config: Partial<PostWriterConfig> = {}) {
    this.config = {
      openaiApiKey: process.env.OPENAI_API_KEY,
      ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
      useLocalLlm: false,
      ...config
    };
  }

  async generatePostVariations(topic: string, angle: string, brand: string): Promise<PostVariation[]> {
    console.log(`✍️ Generating post variations for: ${topic}`);
    
    const variations: PostVariation[] = [];
    
    // Generate 3 variations
    const [hookPost, carouselPost, videoScript] = await Promise.all([
      this.generateHookPost(topic, angle, brand),
      this.generateCarouselPost(topic, angle, brand),
      this.generateVideoScript(topic, angle, brand)
    ]);

    variations.push(hookPost, carouselPost, videoScript);
    
    console.log(`✅ Generated ${variations.length} post variations`);
    return variations;
  }

  private async generateHookPost(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.getRandomItem(CTAS);
    const painPoint = this.getRandomItem(PAIN_POINTS);
    const revenue = this.generateRevenueNumber('mid');
    
    const templates = [
      `🚀 ${angle}\n\nI was struggling with ${painPoint} just 6 months ago.\n\nThen I discovered ${topic}.\n\nNow? I'm making ${revenue}/month consistently.\n\nHere's the exact framework I used:\n\n1️⃣ [Step 1]\n2️⃣ [Step 2]\n3️⃣ [Step 3]\n\n${cta} for the full guide 👇\n\n#PassiveIncome #SideHustle #${this.sanitizeHashtag(topic)}`,
      
      `💡 Stop scrolling if you want to escape the 9-5.\n\n${topic} changed my life.\n\nI went from ${painPoint} to earning ${revenue}/month.\n\nThe best part? I work 2 hours a day.\n\nHere's what nobody tells you about ${topic}:\n\n→ You don't need experience\n→ You can start with $0\n→ Results come fast\n\n${cta} and I'll show you how 🔥\n\n#FinancialFreedom #OnlineIncome`,
      
      `⚠️ If you're still thinking about ${topic}, read this.\n\nI almost gave up because of ${painPoint}.\n\nBut I pushed through.\n\nResult? ${revenue}/month. On autopilot.\n\nThe secret? I automated everything.\n\n${cta} to get my exact system 💰\n\n#Automation #PassiveIncome #${this.sanitizeHashtag(topic)}`
    ];

    const text = this.getRandomItem(templates);
    
    return {
      id: uuidv4(),
      text: this.addRandomEmojis(text, 3),
      imagePrompt: `Professional Asian entrepreneur celebrating success, laptop showing ${revenue} revenue, modern office, golden hour lighting, 8K photography`,
      platform: 'twitter',
      type: 'hook',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint,
        emojiCount: (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu) || []).length,
        wordCount: text.split(/\s+/).length
      }
    };
  }

  private async generateCarouselPost(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.getRandomItem(CTAS);
    const painPoint = this.getRandomItem(PAIN_POINTS);
    const revenue = this.generateRevenueNumber('high');
    
    const slides = [
      `SLIDE 1: 🚀 ${angle}`,
      `SLIDE 2: ❌ The Problem: Most people face ${painPoint}`,
      `SLIDE 3: 💡 The Solution: ${topic}`,
      `SLIDE 4: 📊 My Results: ${revenue}/month`,
      `SLIDE 5: 🔑 Key #1: Start small, think big`,
      `SLIDE 6: 🔑 Key #2: Automate everything`,
      `SLIDE 7: 🔑 Key #3: Be consistent`,
      `SLIDE 8: 📈 The Growth: 0 → 10K followers in 30 days`,
      `SLIDE 9: 💰 The Income: ${revenue} passive monthly`,
      `SLIDE 10: 🎯 ${cta} for the full blueprint!`
    ];

    const text = slides.join('\n\n');
    
    return {
      id: uuidv4(),
      text,
      imagePrompt: `Minimalist carousel design, professional business style, gradient background with teal and purple, modern typography, clean layout, 10 slides`,
      platform: 'instagram',
      type: 'carousel',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint,
        emojiCount: 10,
        wordCount: text.split(/\s+/).length
      }
    };
  }

  private async generateVideoScript(topic: string, angle: string, brand: string): Promise<PostVariation> {
    const cta = this.getRandomItem(CTAS);
    const painPoint = this.getRandomItem(PAIN_POINTS);
    const revenue = this.generateRevenueNumber('mid');
    
    const script = `🎬 VIDEO SCRIPT (15 seconds)\n\n[SCENE 1 - 0-5s]\nHook: "Stop scrolling! ${angle}"\nVisual: Close-up of face, excited expression\n\n[SCENE 2 - 5-10s]\nProblem: "Tired of ${painPoint}?"\nVisual: Show struggle (frustrated at desk)\n\n[SCENE 3 - 10-15s]\nSolution: "I make ${revenue}/month with ${topic}. ${cta}!"\nVisual: Show success (laptop with income, celebration)\n\nCaption: ${topic} is the future. Don't get left behind. ${cta} 👇\n\n#${this.sanitizeHashtag(topic)} #PassiveIncome #SideHustle`;

    return {
      id: uuidv4(),
      text: script,
      imagePrompt: `Video thumbnail, dramatic lighting, split screen showing struggle vs success, young Asian professional, modern aesthetic, viral style`,
      platform: 'douyin',
      type: 'video_script',
      metadata: {
        cta,
        revenueNumber: revenue,
        painPoint,
        emojiCount: 3,
        wordCount: script.split(/\s+/).length
      }
    };
  }

  private generateRevenueNumber(range: 'low' | 'mid' | 'high'): string {
    const { min, max } = REVENUE_RANGES[range];
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Randomly choose currency
    const currencies = ['¥', '$'];
    const currency = this.getRandomItem(currencies);
    
    return `${currency}${amount.toLocaleString()}`;
  }

  private addRandomEmojis(text: string, maxEmojis: number): string {
    const emojis = ['🚀', '💰', '🔥', '💡', '📈', '✅', '⚡', '🎯', '💪', '🌟'];
    const lines = text.split('\n');
    const emojiCount = Math.floor(Math.random() * maxEmojis) + 1;
    
    for (let i = 0; i < emojiCount; i++) {
      const lineIndex = Math.floor(Math.random() * lines.length);
      const emoji = this.getRandomItem(emojis);
      
      if (!lines[lineIndex].includes(emoji)) {
        lines[lineIndex] = emoji + ' ' + lines[lineIndex];
      }
    }
    
    return lines.join('\n');
  }

  private sanitizeHashtag(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '')
      .substring(0, 20);
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  async generateWithAI(topic: string, angle: string, platform: string): Promise<string> {
    if (this.config.useLocalLlm) {
      return this.generateWithOllama(topic, angle, platform);
    }
    return this.generateWithOpenAI(topic, angle, platform);
  }

  private async generateWithOpenAI(topic: string, angle: string, platform: string): Promise<string> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a social media expert. Generate engaging posts for ${platform}. Include a CTA, a revenue number between ¥500-5000, and a pain point. Use emojis sparingly (max 3).`
          },
          {
            role: 'user',
            content: `Generate a post about: ${topic}\nAngle: ${angle}\nPlatform: ${platform}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private async generateWithOllama(topic: string, angle: string, platform: string): Promise<string> {
    const response = await fetch(`${this.config.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Generate a social media post for ${platform} about ${topic}. Angle: ${angle}. Include CTA, revenue number, and pain point. Use emojis.`,
        stream: false
      })
    });

    const data = await response.json();
    return data.response || '';
  }
}

export async function generatePosts(topic: string, angle: string, brand: string): Promise<PostVariation[]> {
  const writer = new PostWriter();
  return writer.generatePostVariations(topic, angle, brand);
}
