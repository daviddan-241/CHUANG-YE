import fs from 'fs';
import path from 'path';

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  style?: 'lifestyle' | 'professional' | 'casual' | 'workspace' | 'conference';
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  referenceImage?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: string;
  metadata?: {
    prompt: string;
    style: string;
    seed: number;
    steps: number;
  };
}

const STYLE_PRESETS: Record<string, { prompt: string; negativePrompt: string }> = {
  lifestyle: {
    prompt: 'Photorealistic, lifestyle photo, natural lighting, casual setting, high quality, 8K, professional photography',
    negativePrompt: 'cartoon, anime, illustration, painting, drawing, sketch, blurry, low quality, deformed'
  },
  professional: {
    prompt: 'Professional headshot, business attire, studio lighting, corporate setting, high quality, 8K, professional photography',
    negativePrompt: 'casual, cartoon, anime, illustration, painting, drawing, sketch, blurry, low quality, deformed'
  },
  casual: {
    prompt: 'Casual photo, relaxed pose, natural setting, warm lighting, high quality, 8K, professional photography',
    negativePrompt: 'formal, cartoon, anime, illustration, painting, drawing, sketch, blurry, low quality, deformed'
  },
  workspace: {
    prompt: 'Workspace photo, modern office, computer setup, professional environment, high quality, 8K, professional photography',
    negativePrompt: 'messy, cluttered, cartoon, anime, illustration, painting, drawing, sketch, blurry, low quality'
  },
  conference: {
    prompt: 'Conference speaking, professional event, stage presence, audience, high quality, 8K, professional photography',
    negativePrompt: 'cartoon, anime, illustration, painting, drawing, sketch, blurry, low quality, deformed'
  }
};

export class ImageGenerator {
  private apiEndpoint: string;
  private outputDir: string;

  constructor(apiEndpoint: string = 'http://localhost:8188') {
    this.apiEndpoint = apiEndpoint;
    this.outputDir = path.join(process.cwd(), 'public', 'images', 'generated');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      console.log('Generating image with prompt:', request.prompt);
      
      // Apply style preset if provided
      let finalPrompt = request.prompt;
      let finalNegativePrompt = request.negativePrompt || '';
      
      if (request.style && STYLE_PRESETS[request.style]) {
        finalPrompt = `${STYLE_PRESETS[request.style].prompt}, ${request.prompt}`;
        finalNegativePrompt = finalNegativePrompt 
          ? `${STYLE_PRESETS[request.style].negativePrompt}, ${finalNegativePrompt}`
          : STYLE_PRESETS[request.style].negativePrompt;
      }

      // Prepare generation parameters
      const params = {
        prompt: finalPrompt,
        negative_prompt: finalNegativePrompt,
        width: request.width || 1024,
        height: request.height || 1024,
        steps: request.steps || 30,
        cfg_scale: request.cfgScale || 7,
        seed: request.seed || Math.floor(Math.random() * 1000000),
      };

      // Try to connect to ComfyUI or Stable Diffusion API
      const result = await this.callImageAPI(params);
      
      if (result.success && result.imageUrl) {
        // Save image locally
        const filename = `img_${Date.now()}_${params.seed}.png`;
        const localPath = path.join(this.outputDir, filename);
        
        // Download and save image
        await this.downloadImage(result.imageUrl, localPath);
        
        return {
          success: true,
          imageUrl: `/images/generated/${filename}`,
          localPath,
          metadata: {
            prompt: finalPrompt,
            style: request.style || 'default',
            seed: params.seed,
            steps: params.steps
          }
        };
      }

      // If API fails, generate placeholder
      return this.generatePlaceholder(request);
      
    } catch (error) {
      console.error('Image generation failed:', error);
      
      // Fallback to placeholder
      return this.generatePlaceholder(request);
    }
  }

  private async callImageAPI(params: any): Promise<{ success: boolean; imageUrl?: string }> {
    try {
      // Try ComfyUI API
      const response = await fetch(`${this.apiEndpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          imageUrl: data.imageUrl || data.output?.[0]
        };
      }

      // Try alternative API format
      const altResponse = await fetch(`${this.apiEndpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          negative_prompt: params.negative_prompt,
          width: params.width,
          height: params.height,
          steps: params.steps,
          cfg_scale: params.cfg_scale,
          seed: params.seed,
        }),
        signal: AbortSignal.timeout(60000)
      });

      if (altResponse.ok) {
        const data = await altResponse.json();
        if (data.images && data.images.length > 0) {
          return {
            success: true,
            imageUrl: `data:image/png;base64,${data.images[0]}`
          };
        }
      }

      return { success: false };
    } catch (error) {
      console.log('Image API not available, using placeholder');
      return { success: false };
    }
  }

  private async downloadImage(url: string, outputPath: string): Promise<void> {
    try {
      if (url.startsWith('data:')) {
        // Handle base64 image
        const base64Data = url.split(',')[1];
        fs.writeFileSync(outputPath, Buffer.from(base64Data, 'base64'));
      } else {
        // Download from URL
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(outputPath, Buffer.from(buffer));
      }
    } catch (error) {
      console.error('Failed to download image:', error);
      throw error;
    }
  }

  private generatePlaceholder(request: ImageGenerationRequest): ImageGenerationResult {
    // Generate a placeholder image using SVG
    const width = request.width || 1024;
    const height = request.height || 1024;
    const seed = request.seed || Math.floor(Math.random() * 1000000);
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0a0f;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#bg)"/>
        <rect x="10%" y="10%" width="80%" height="80%" rx="20" fill="url(#accent)" stroke="rgba(6,182,212,0.3)" stroke-width="2"/>
        <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#06b6d4" text-anchor="middle" dominant-baseline="middle">DAVE Social AI</text>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">Image Placeholder</text>
        <text x="50%" y="65%" font-family="monospace" font-size="12" fill="#4b5563" text-anchor="middle" dominant-baseline="middle">Seed: ${seed}</text>
        <text x="50%" y="75%" font-family="monospace" font-size="10" fill="#374151" text-anchor="middle" dominant-baseline="middle">${request.prompt?.substring(0, 50) || 'No prompt'}...</text>
      </svg>
    `;

    const filename = `placeholder_${Date.now()}_${seed}.svg`;
    const localPath = path.join(this.outputDir, filename);
    fs.writeFileSync(localPath, svg);

    return {
      success: true,
      imageUrl: `/images/generated/${filename}`,
      localPath,
      metadata: {
        prompt: request.prompt,
        style: request.style || 'default',
        seed,
        steps: request.steps || 0
      }
    };
  }

  async generateFromPost(postContent: string, style?: string): Promise<ImageGenerationResult> {
    // Auto-generate image prompt from post content
    const imagePrompt = this.createImagePrompt(postContent, style);
    
    return this.generate({
      prompt: imagePrompt,
      style: style as any || 'professional',
      width: 1024,
      height: 1024
    });
  }

  private createImagePrompt(postContent: string, style?: string): string {
    // Extract key themes from post content
    const themes = this.extractThemes(postContent);
    
    // Build image prompt based on themes and style
    let prompt = 'Photorealistic, high quality, 8K, professional photography, ';
    
    if (style === 'professional') {
      prompt += 'business professional, ';
    } else if (style === 'lifestyle') {
      prompt += 'lifestyle photo, ';
    }
    
    prompt += themes.join(', ');
    
    return prompt;
  }

  private extractThemes(content: string): string[] {
    const themes: string[] = [];
    
    // Simple keyword extraction
    const keywords = content.toLowerCase();
    
    if (keywords.includes('ai') || keywords.includes('artificial intelligence')) {
      themes.push('technology', 'futuristic');
    }
    if (keywords.includes('business') || keywords.includes('startup')) {
      themes.push('business', 'professional');
    }
    if (keywords.includes('data') || keywords.includes('analytics')) {
      themes.push('data visualization', 'charts');
    }
    if (keywords.includes('social') || keywords.includes('marketing')) {
      themes.push('social media', 'marketing');
    }
    if (keywords.includes('innovation') || keywords.includes('future')) {
      themes.push('innovation', 'modern');
    }
    
    // Default themes if none found
    if (themes.length === 0) {
      themes.push('professional', 'modern', 'clean');
    }
    
    return themes;
  }
}

// Singleton instance
let imageGeneratorInstance: ImageGenerator | null = null;

export function getImageGenerator(apiEndpoint?: string): ImageGenerator {
  if (!imageGeneratorInstance) {
    imageGeneratorInstance = new ImageGenerator(apiEndpoint);
  }
  return imageGeneratorInstance;
}
