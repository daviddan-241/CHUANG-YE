import { ComfyUIClient, getComfyUIClient, ImageGenerationRequest } from './comfyui-client';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface BatchConfig {
  imagesPerBrand: number;
  lifestyleCount: number;
  paymentCount: number;
  carouselCount: number;
  brands: string[];
}

const DEFAULT_CONFIG: BatchConfig = {
  imagesPerBrand: 20,
  lifestyleCount: 10,
  paymentCount: 5,
  carouselCount: 5,
  brands: ['brandA', 'brandB']
};

const LIFESTYLE_PROMPTS = [
  'Young Asian professional working on laptop in modern coffee shop, natural lighting, focused expression',
  'Asian entrepreneur giving presentation in conference room, professional attire, confident pose',
  'Professional checking smartphone while walking in city, business district background, golden hour',
  'Asian businessperson reviewing documents at standing desk, modern office, natural light',
  'Entrepreneur celebrating success at desk, laptop showing growth chart, genuine smile',
  'Professional having video call in home office, modern setup, plants in background',
  'Asian executive looking out office window, city skyline, thoughtful expression',
  'Business meeting with team, collaborative discussion, modern conference room',
  'Professional taking notes in notebook, coffee shop setting, warm lighting',
  'Entrepreneur working on tablet while traveling, airport lounge, business class'
];

const PAYMENT_PROMPTS = [
  'Smartphone showing WeChat Pay success notification, green checkmark, amount ¥999, blurred background',
  'Mobile banking app showing received payment, modern UI design, success confirmation',
  'PayPal transaction confirmation screen, professional interface, payment received',
  'Alipay payment success screen, red and white design, amount displayed clearly',
  'Bank transfer confirmation on mobile, professional banking app, notification badge'
];

const CAROUSEL_PROMPTS = [
  'Minimalist gradient background, teal to purple transition, subtle geometric patterns',
  'Clean white background with soft shadows, modern design elements, professional template',
  'Dark gradient background with neon accents, tech-inspired design, futuristic feel',
  'Pastel gradient with subtle texture, Instagram carousel template, clean typography',
  'Professional business template, light gray background, minimal design elements'
];

export class BatchGenerator {
  private client: ComfyUIClient;
  private config: BatchConfig;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = getComfyUIClient();
  }

  async generateBatch(): Promise<void> {
    console.log('🖼️ Starting batch image generation...');
    
    // Check if ComfyUI is available
    const isConnected = await this.client.checkConnection();
    if (!isConnected) {
      console.log('⚠️ ComfyUI not available, generating placeholders');
    }

    for (const brandId of this.config.brands) {
      console.log(`📸 Generating images for brand: ${brandId}`);
      
      try {
        // Generate lifestyle images
        await this.generateLifestyleImages(brandId);
        
        // Generate payment screenshots
        await this.generatePaymentImages(brandId);
        
        // Generate carousel backgrounds
        await this.generateCarouselImages(brandId);
        
        console.log(`✅ Completed batch for ${brandId}`);
      } catch (error) {
        console.error(`❌ Error generating batch for ${brandId}:`, error);
      }
    }

    console.log('🖼️ Batch generation complete');
  }

  private async generateLifestyleImages(brandId: string): Promise<void> {
    console.log(`  Generating ${this.config.lifestyleCount} lifestyle images...`);
    
    for (let i = 0; i < this.config.lifestyleCount; i++) {
      const prompt = LIFESTYLE_PROMPTS[i % LIFESTYLE_PROMPTS.length];
      
      const request: ImageGenerationRequest = {
        prompt,
        type: 'lifestyle',
        width: 1024,
        height: 1024,
        brandId,
        useReference: true
      };

      const result = await this.client.generateImage(request);
      
      if (result.success && result.localPath) {
        await this.saveToDatabase(brandId, 'lifestyle', result.localPath, prompt);
      }
      
      // Add delay between generations
      await this.delay(2000);
    }
  }

  private async generatePaymentImages(brandId: string): Promise<void> {
    console.log(`  Generating ${this.config.paymentCount} payment images...`);
    
    for (let i = 0; i < this.config.paymentCount; i++) {
      const amount = Math.floor(Math.random() * 4500) + 500;
      const prompt = PAYMENT_PROMPTS[i % PAYMENT_PROMPTS.length].replace('¥999', `¥${amount}`);
      
      const request: ImageGenerationRequest = {
        prompt,
        type: 'payment',
        width: 1080,
        height: 1920, // Portrait for mobile screenshots
        brandId
      };

      const result = await this.client.generateImage(request);
      
      if (result.success && result.localPath) {
        await this.saveToDatabase(brandId, 'payment', result.localPath, prompt);
      }
      
      await this.delay(2000);
    }
  }

  private async generateCarouselImages(brandId: string): Promise<void> {
    console.log(`  Generating ${this.config.carouselCount} carousel images...`);
    
    for (let i = 0; i < this.config.carouselCount; i++) {
      const prompt = CAROUSEL_PROMPTS[i % CAROUSEL_PROMPTS.length];
      
      const request: ImageGenerationRequest = {
        prompt,
        type: 'carousel',
        width: 1080,
        height: 1080, // Square for Instagram
        brandId
      };

      const result = await this.client.generateImage(request);
      
      if (result.success && result.localPath) {
        await this.saveToDatabase(brandId, 'carousel', result.localPath, prompt);
      }
      
      await this.delay(2000);
    }
  }

  private async saveToDatabase(brandId: string, type: string, path: string, prompt: string): Promise<void> {
    try {
      await prisma.brandImage.create({
        data: {
          brandId,
          type,
          path,
          prompt,
          metadata: JSON.stringify({
            generatedAt: new Date().toISOString(),
            generator: 'batch'
          })
        }
      });
    } catch (error) {
      console.error('Failed to save image to database:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getRandomImage(brandId: string, type: string): Promise<string | null> {
    try {
      const images = await prisma.brandImage.findMany({
        where: {
          brandId,
          type,
          isUsed: false
        }
      });

      if (images.length === 0) {
        // Reset all images as available
        await prisma.brandImage.updateMany({
          where: { brandId, type },
          data: { isUsed: false }
        });
        
        const allImages = await prisma.brandImage.findMany({
          where: { brandId, type }
        });
        
        if (allImages.length === 0) return null;
        
        const randomImage = allImages[Math.floor(Math.random() * allImages.length)];
        await prisma.brandImage.update({
          where: { id: randomImage.id },
          data: { isUsed: true }
        });
        
        return randomImage.path;
      }

      const randomImage = images[Math.floor(Math.random() * images.length)];
      await prisma.brandImage.update({
        where: { id: randomImage.id },
        data: { isUsed: true }
      });

      return randomImage.path;
    } catch (error) {
      console.error('Failed to get random image:', error);
      return null;
    }
  }

  async getImageStats(brandId: string): Promise<Record<string, { total: number; available: number }>> {
    const types = ['lifestyle', 'payment', 'carousel', 'whiteboard', 'analytics'];
    const stats: Record<string, { total: number; available: number }> = {};

    for (const type of types) {
      const total = await prisma.brandImage.count({
        where: { brandId, type }
      });
      
      const available = await prisma.brandImage.count({
        where: { brandId, type, isUsed: false }
      });

      stats[type] = { total, available };
    }

    return stats;
  }
}

// Singleton instance
let batchGeneratorInstance: BatchGenerator | null = null;

export function getBatchGenerator(config?: Partial<BatchConfig>): BatchGenerator {
  if (!batchGeneratorInstance) {
    batchGeneratorInstance = new BatchGenerator(config);
  }
  return batchGeneratorInstance;
}

// Cron job function
export async function runBatchGeneration(): Promise<void> {
  const generator = getBatchGenerator();
  await generator.generateBatch();
}
