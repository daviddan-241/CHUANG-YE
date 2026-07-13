import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ComfyUIConfig {
  apiUrl: string;
  timeout: number;
  outputDir: string;
  referencePhotosDir: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  type: 'lifestyle' | 'payment' | 'carousel' | 'whiteboard' | 'analytics';
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  useReference?: boolean;
  brandId?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  error?: string;
  metadata: {
    prompt: string;
    type: string;
    seed: number;
    timestamp: Date;
  };
}

const DEFAULT_CONFIG: ComfyUIConfig = {
  apiUrl: process.env.COMFYUI_URL || 'http://127.0.0.1:8188',
  timeout: 120000,
  outputDir: path.join(process.cwd(), 'public', 'media'),
  referencePhotosDir: path.join(process.cwd(), 'public', 'reference-photos')
};

const IMAGE_TYPE_PROMPTS: Record<string, string> = {
  lifestyle: `Photorealistic Asian professional, age 30, wearing business casual, working on laptop with coffee, modern minimalist office background, natural window lighting, Canon EOS R5, 85mm lens, 8K resolution, sharp focus, professional photography`,
  
  payment: `Close-up of smartphone screen showing mobile payment success notification, green checkmark icon, transaction amount displayed clearly, blurred desk background with coffee and notebook, realistic UI design, 8K photography`,
  
  carousel: `Minimalist gradient background, smooth color transition, subtle geometric shapes, clean modern design, professional social media template, 8K resolution, Instagram carousel style`,
  
  whiteboard: `Hand-drawn flowchart on whiteboard, colorful markers, 3-step process diagram, arrows connecting steps, realistic shadows, office environment, professional presentation style, 8K photography`,
  
  analytics: `Computer screen showing analytics dashboard, green upward trending arrow, multiple charts and graphs, data visualization, modern UI design, professional business analytics, 8K resolution`
};

export class ComfyUIClient {
  private config: ComfyUIConfig;
  private isConnected: boolean = false;

  constructor(config: Partial<ComfyUIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    const dirs = [
      this.config.outputDir,
      path.join(this.config.outputDir, 'lifestyle'),
      path.join(this.config.outputDir, 'payment'),
      path.join(this.config.outputDir, 'carousel'),
      path.join(this.config.outputDir, 'whiteboard'),
      path.join(this.config.outputDir, 'analytics'),
      this.config.referencePhotosDir
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/system_stats`, {
        signal: AbortSignal.timeout(5000)
      });
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    console.log(`🎨 Generating ${request.type} image...`);
    
    // Check connection
    const isConnected = await this.checkConnection();
    
    if (!isConnected) {
      console.log('⚠️ ComfyUI not available, generating placeholder');
      return this.generatePlaceholder(request);
    }

    try {
      // Build full prompt
      const fullPrompt = this.buildPrompt(request);
      
      // Submit to ComfyUI
      const workflow = this.buildWorkflow(fullPrompt, request);
      const response = await fetch(`${this.config.apiUrl}/api/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`ComfyUI API error: ${response.status}`);
      }

      const data = await response.json();
      const promptId = data.prompt_id;

      // Wait for completion
      const imageUrl = await this.waitForCompletion(promptId);
      
      // Download and save image
      const localPath = await this.saveImage(imageUrl, request);

      return {
        success: true,
        imageUrl,
        localPath,
        metadata: {
          prompt: fullPrompt,
          type: request.type,
          seed: request.seed || 0,
          timestamp: new Date()
        }
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      return this.generatePlaceholder(request);
    }
  }

  private buildPrompt(request: ImageGenerationRequest): string {
    const typePrompt = IMAGE_TYPE_PROMPTS[request.type] || IMAGE_TYPE_PROMPTS.lifestyle;
    const customPrompt = request.prompt || '';
    
    let fullPrompt = `${typePrompt}, ${customPrompt}`;
    
    // Add IP-Adapter reference if enabled
    if (request.useReference) {
      fullPrompt += ', consistent face from reference photo, IP-Adapter face reference';
    }
    
    // Add brand-specific details
    if (request.brandId) {
      fullPrompt += ', brand consistent style';
    }
    
    return fullPrompt;
  }

  private buildWorkflow(prompt: string, request: ImageGenerationRequest): any {
    // ComfyUI workflow JSON
    return {
      prompt: {
        3: {
          class_type: 'KSampler',
          inputs: {
            seed: request.seed || Math.floor(Math.random() * 1000000),
            steps: request.steps || 30,
            cfg: request.cfgScale || 7,
            sampler_name: 'euler_ancestral',
            scheduler: 'normal',
            denoise: 1,
            model: ['4', 0],
            positive: ['6', 0],
            negative: ['7', 0],
            latent_image: ['5', 0]
          }
        },
        4: {
          class_type: 'CheckpointLoaderSimple',
          inputs: {
            ckpt_name: 'sd_xl_base_1.0.safetensors'
          }
        },
        5: {
          class_type: 'EmptyLatentImage',
          inputs: {
            width: request.width || 1024,
            height: request.height || 1024,
            batch_size: 1
          }
        },
        6: {
          class_type: 'CLIPTextEncode',
          inputs: {
            text: prompt,
            clip: ['4', 1]
          }
        },
        7: {
          class_type: 'CLIPTextEncode',
          inputs: {
            text: 'blurry, low quality, distorted, deformed, ugly, bad anatomy',
            clip: ['4', 1]
          }
        },
        8: {
          class_type: 'VAEDecode',
          inputs: {
            samples: ['3', 0],
            vae: ['4', 2]
          }
        },
        9: {
          class_type: 'SaveImage',
          inputs: {
            filename_prefix: 'dave_output',
            images: ['8', 0]
          }
        }
      }
    };
  }

  private async waitForCompletion(promptId: string): Promise<string> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.timeout) {
      try {
        const response = await fetch(`${this.config.apiUrl}/history/${promptId}`);
        const data = await response.json();
        
        if (data[promptId]?.outputs?.['9']?.images?.[0]) {
          const imageData = data[promptId].outputs['9'].images[0];
          return `${this.config.apiUrl}/view?filename=${imageData.filename}&subfolder=${imageData.subfolder}&type=${imageData.type}`;
        }
      } catch (error) {
        // Continue polling
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Image generation timeout');
  }

  private async saveImage(imageUrl: string, request: ImageGenerationRequest): Promise<string> {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    const filename = `${request.type}_${Date.now()}_${uuidv4().substring(0, 8)}.png`;
    const filepath = path.join(this.config.outputDir, request.type, filename);
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    
    return `/media/${request.type}/${filename}`;
  }

  private generatePlaceholder(request: ImageGenerationRequest): ImageGenerationResult {
    const seed = request.seed || Math.floor(Math.random() * 1000000);
    const width = request.width || 1024;
    const height = request.height || 1024;
    
    // Generate SVG placeholder
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="100%" style="stop-color:#1f2937"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect x="5%" y="5%" width="90%" height="90%" rx="20" fill="url(#accent)" stroke="rgba(6,182,212,0.2)" stroke-width="2"/>
  <text x="50%" y="35%" font-family="Arial" font-size="28" fill="#06b6d4" text-anchor="middle" font-weight="bold">DAVE Social AI</text>
  <text x="50%" y="45%" font-family="Arial" font-size="18" fill="#9ca3af" text-anchor="middle">${request.type.toUpperCase()} IMAGE</text>
  <text x="50%" y="55%" font-family="monospace" font-size="14" fill="#4b5563" text-anchor="middle">Seed: ${seed}</text>
  <text x="50%" y="65%" font-family="Arial" font-size="12" fill="#374151" text-anchor="middle">${request.prompt?.substring(0, 60) || 'Auto-generated'}...</text>
  <text x="50%" y="80%" font-family="Arial" font-size="16" fill="#8b5cf6" text-anchor="middle">Placeholder - Connect ComfyUI for real images</text>
</svg>`;

    const filename = `placeholder_${request.type}_${Date.now()}.svg`;
    const filepath = path.join(this.config.outputDir, request.type, filename);
    fs.writeFileSync(filepath, svg);

    return {
      success: true,
      imageUrl: `/media/${request.type}/${filename}`,
      localPath: filepath,
      metadata: {
        prompt: request.prompt || '',
        type: request.type,
        seed,
        timestamp: new Date()
      }
    };
  }

  async generateWithReference(request: ImageGenerationRequest, referencePhotoIndex: number = 0): Promise<ImageGenerationResult> {
    const referenceDir = this.config.referencePhotosDir;
    const referencePhotos = fs.readdirSync(referenceDir).filter(f => 
      f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')
    );

    if (referencePhotos.length === 0) {
      console.log('⚠️ No reference photos found, generating without reference');
      return this.generateImage(request);
    }

    const photoIndex = referencePhotoIndex % referencePhotos.length;
    const referencePhoto = referencePhotos[photoIndex];
    
    console.log(`📸 Using reference photo: ${referencePhoto}`);
    
    // Add reference photo to request
    return this.generateImage({
      ...request,
      useReference: true,
      prompt: `${request.prompt}, face matching reference photo ${referencePhoto}`
    });
  }

  getOutputDir(): string {
    return this.config.outputDir;
  }

  getReferencePhotosDir(): string {
    return this.config.referencePhotosDir;
  }
}

// Singleton instance
let comfyuiClientInstance: ComfyUIClient | null = null;

export function getComfyUIClient(config?: Partial<ComfyUIConfig>): ComfyUIClient {
  if (!comfyuiClientInstance) {
    comfyuiClientInstance = new ComfyUIClient(config);
  }
  return comfyuiClientInstance;
}
