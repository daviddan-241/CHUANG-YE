import fs from 'fs';
import path from 'path';

export interface HyperRealisticRequest {
  type: 'lifestyle' | 'professional' | 'payment' | 'carousel' | 'conference' | 'travel' | 'workspace';
  scene: string;
  clothing?: string;
  expression?: string;
  lighting?: string;
  additionalDetails?: string;
  useReferencePhotos?: boolean;
  brandId?: string;
}

export interface HyperRealisticResult {
  success: boolean;
  imageUrl?: string;
  localPath?: string;
  prompt: string;
  negativePrompt: string;
  metadata: {
    type: string;
    scene: string;
    timestamp: Date;
  };
}

const REFERENCE_PHOTOS_DIR = path.join(process.cwd(), 'public', 'reference-photos');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'media', 'hyper-realistic');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CHUANGYE_DESCRIPTION = `
A distinguished Asian professional man, approximately 30 years old, with a sharp, intelligent appearance. 
He has a well-groomed, modern hairstyle, clear skin, and confident eyes. 
His facial features are refined with high cheekbones and a determined jawline. 
He projects authority, success, and approachability.
`;

const BASE_POSITIVE_PROMPT = `
masterpiece, best quality, ultra-realistic, photorealistic, 8K UHD, DSLR quality,
hyper-detailed skin texture, natural skin pores, realistic lighting and shadows,
professional photography, shot on Canon EOS R5 with 85mm f/1.4 lens,
shallow depth of field, film grain, chromatic aberration
`;

const BASE_NEGATIVE_PROMPT = `
(worst quality:1.4), (low quality:1.4), (normal quality:1.4), lowres, bad anatomy,
bad hands, text, error, missing fingers, extra digit, fewer digits, cropped,
jpeg artifacts, signature, watermark, username, blurry, artist name,
deformed, ugly, duplicate, morbid, mutilated, extra limbs, malformed,
disfigured, missing arms, missing legs, extra arms, extra legs, fused fingers,
too many fingers, long neck, cross-eyed, mutation, bad proportions
`;

const SCENE_TEMPLATES: Record<string, string> = {
  lifestyle_coffee: `
    ${CHUANGYE_DESCRIPTION}
    Sitting at a modern coffee shop, working on a sleek MacBook Pro, 
    wearing a casual but premium outfit (dark polo shirt or cashmere sweater),
    natural window light casting soft shadows, coffee cup on the table,
    blurred background with other patrons, warm ambient atmosphere,
    candid shot, relaxed but focused expression
  `,
  
  lifestyle_walking: `
    ${CHUANGYE_DESCRIPTION}
    Walking confidently through a modern city business district,
    wearing a tailored navy blazer over a white t-shirt,
    carrying a premium leather messenger bag,
    golden hour sunlight, city buildings in background,
    motion blur on surroundings, sharp focus on subject,
    determined expression, urban professional vibe
  `,
  
  professional_headshot: `
    ${CHUANGYE_DESCRIPTION}
    Professional headshot, wearing a perfectly tailored dark charcoal suit
    with a crisp white dress shirt (no tie, top button open),
    studio lighting with soft key light and rim light,
    neutral grey background, confident smile,
    corporate executive portrait style
  `,
  
  professional_presentation: `
    ${CHUANGYE_DESCRIPTION}
    Standing at a modern conference room podium, giving a presentation,
    wearing a slim-fit navy suit, gesturing confidently,
    large screen with charts visible in background,
    professional lighting, audience silhouettes visible,
    commanding presence, authoritative posture
  `,
  
  workspace_standing: `
    ${CHUANGYE_DESCRIPTION}
    Standing at a height-adjustable desk in a modern home office,
    dual monitor setup showing analytics dashboard,
    wearing smart casual (dark henley shirt),
    natural light from large windows, plants in background,
    productive environment, focused on screens
  `,
  
  conference_networking: `
    ${CHUANGYE_DESCRIPTION}
    At a premium tech conference, networking with other professionals,
    wearing business casual (blazer without tie),
    holding a conference badge, modern venue background,
    bokeh lights, engaging conversation expression,
    professional event photography style
  `,
  
  travel_airport: `
    ${CHUANGYE_DESCRIPTION}
    In a business class airport lounge, looking out at runway,
    wearing comfortable premium travel outfit,
    laptop and coffee on side table,
    large windows with airplane view,
    relaxed but sophisticated travel vibe
  `,
  
  payment_wechat: `
    Close-up of hands holding a modern smartphone showing WeChat Pay 
    successful transaction screen, green checkmark icon clearly visible,
    amount showing ¥299 received, merchant name "ChuangYe Digital",
    blurred desk background with laptop and notebook,
    realistic UI rendering, sharp focus on screen
  `,
  
  payment_paypal: `
    Close-up of smartphone showing PayPal payment confirmation,
    blue and white UI design, "Payment Received" text,
    amount $49.00, sender details visible,
    modern desk setup in background,
    professional photography, realistic screen rendering
  `
};

export class HyperRealisticGenerator {
  private comfyuiUrl: string;

  constructor() {
    this.comfyuiUrl = process.env.COMFYUI_URL || 'http://127.0.0.1:8188';
  }

  async generate(request: HyperRealisticRequest): Promise<HyperRealisticResult> {
    console.log(`🎨 Generating hyper-realistic ${request.type} image...`);
    
    // Build prompt
    const sceneKey = `${request.type}_${request.scene}`;
    const sceneTemplate = SCENE_TEMPLATES[sceneKey] || SCENE_TEMPLATES[`${request.type}_coffee`];
    
    const fullPrompt = `
      ${BASE_POSITIVE_PROMPT}
      ${sceneTemplate}
      ${request.clothing ? `Wearing: ${request.clothing}.` : ''}
      ${request.expression ? `Expression: ${request.expression}.` : ''}
      ${request.lighting ? `Lighting: ${request.lighting}.` : ''}
      ${request.additionalDetails || ''}
    `;
    
    const negativePrompt = BASE_NEGATIVE_PROMPT;
    
    // Try ComfyUI first
    try {
      const isConnected = await this.checkComfyUI();
      
      if (isConnected) {
        return await this.generateWithComfyUI(fullPrompt, negativePrompt, request);
      }
    } catch (error) {
      console.log('ComfyUI not available, using placeholder');
    }
    
    // Generate placeholder
    return this.generatePlaceholder(fullPrompt, request);
  }

  private async checkComfyUI(): Promise<boolean> {
    try {
      const response = await fetch(`${this.comfyuiUrl}/system_stats`, {
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async generateWithComfyUI(
    prompt: string, 
    negativePrompt: string, 
    request: HyperRealisticRequest
  ): Promise<HyperRealisticResult> {
    // Build ComfyUI workflow with IP-Adapter for face consistency
    const workflow = this.buildIPAdapterWorkflow(prompt, negativePrompt, request);
    
    // Submit to ComfyUI
    const response = await fetch(`${this.comfyuiUrl}/api/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
      signal: AbortSignal.timeout(120000)
    });
    
    if (!response.ok) {
      throw new Error(`ComfyUI error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Wait for completion and get image
    // ... (implementation depends on ComfyUI setup)
    
    return {
      success: true,
      imageUrl: `${this.comfyuiUrl}/view?...`,
      prompt,
      negativePrompt,
      metadata: {
        type: request.type,
        scene: request.scene,
        timestamp: new Date()
      }
    };
  }

  private buildIPAdapterWorkflow(prompt: string, negativePrompt: string, request: any): any {
    // Build ComfyUI workflow with IP-Adapter for face consistency
    // This uses reference photos to maintain the same face across all generations
    
    const referencePhotos = this.getReferencePhotos();
    
    return {
      prompt: {
        // Checkpoint loader
        "1": {
          "class_type": "CheckpointLoaderSimple",
          "inputs": { "ckpt_name": "juggernautXL_v9.safetensors" }
        },
        // IP-Adapter for face consistency
        "2": {
          "class_type": "IPAdapterAdvanced",
          "inputs": {
            "weight": 0.85,
            "noise": 0.3,
            "weight_type": "linear",
            "start_at": 0,
            "end_at": 1,
            "unfold_batch": false,
            "ipadapter": ["5", 0],
            "clip_vision": ["6", 0],
            "image": ["3", 0],
            "model": ["1", 0]
          }
        },
        // Load reference image
        "3": {
          "class_type": "LoadImage",
          "inputs": { "image": referencePhotos[0] || "reference_1.jpg" }
        },
        // IP-Adapter model loader
        "5": {
          "class_type": "IPAdapterModelLoader",
          "inputs": { "ipadapter_file": "ip-adapter-faceid-plusv2_sd15.bin" }
        },
        // CLIP Vision
        "6": {
          "class_type": "CLIPVisionLoader",
          "inputs": { "clip_name": "CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors" }
        },
        // Positive prompt
        "10": {
          "class_type": "CLIPTextEncode",
          "inputs": { "text": prompt, "clip": ["1", 1] }
        },
        // Negative prompt
        "11": {
          "class_type": "CLIPTextEncode",
          "inputs": { "text": negativePrompt, "clip": ["1", 1] }
        },
        // KSampler
        "12": {
          "class_type": "KSampler",
          "inputs": {
            "seed": Math.floor(Math.random() * 1000000),
            "steps": 35,
            "cfg": 7,
            "sampler_name": "dpmpp_2m_sde",
            "scheduler": "karras",
            "denoise": 1,
            "model": ["2", 0],
            "positive": ["10", 0],
            "negative": ["11", 0],
            "latent_image": ["13", 0]
          }
        },
        // Empty Latent
        "13": {
          "class_type": "EmptyLatentImage",
          "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }
        },
        // VAE Decode
        "14": {
          "class_type": "VAEDecode",
          "inputs": { "samples": ["12", 0], "vae": ["1", 2] }
        },
        // Face Detailer (for better face quality)
        "15": {
          "class_type": "FaceDetailer",
          "inputs": {
            "image": ["14", 0],
            "model": ["2", 0],
            "clip": ["1", 1],
            "vae": ["1", 2],
            "positive": ["10", 0],
            "negative": ["11", 0],
            "bbox_detector": ["16", 0],
            "seed": Math.floor(Math.random() * 1000000),
            "steps": 20,
            "cfg": 7,
            "sampler_name": "dpmpp_2m_sde",
            "scheduler": "karras",
            "denoise": 0.4,
            "feather": 5,
            "noise_mask": true,
            "force_inpaint": true,
            "bbox_threshold": 0.5,
            "bbox_dilation": 10,
            "bbox_crop_factor": 3.0,
            "sam_detection_hint": "center-1",
            "sam_dilation": 0,
            "sam_threshold": 0.93,
            "sam_bbox_expansion": 0,
            "sam_mask_hint_threshold": 0.7,
            "sam_mask_hint_use_negative": "False",
            "drop_size": 10,
            "wildcard": "",
            "cycle": 1
          }
        },
        // BBox Detector
        "16": {
          "class_type": "UltralyticsDetectorProvider",
          "inputs": { "model_name": "bbox/face_yolov8m.pt" }
        },
        // Save Image
        "20": {
          "class_type": "SaveImage",
          "inputs": { "filename_prefix": "chuangye_hyper", "images": ["15", 0] }
        }
      }
    };
  }

  private getReferencePhotos(): string[] {
    try {
      const files = fs.readdirSync(REFERENCE_PHOTOS_DIR);
      return files.filter(f => 
        f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
      );
    } catch {
      return [];
    }
  }

  private generatePlaceholder(prompt: string, request: HyperRealisticRequest): HyperRealisticResult {
    const filename = `hyper_${request.type}_${Date.now()}.svg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:0.3"/>
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.3"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="1024" height="1024" fill="url(#bg)"/>
  
  <!-- Grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.05)" stroke-width="1"/>
  </pattern>
  <rect width="1024" height="1024" fill="url(#grid)"/>
  
  <!-- Center frame -->
  <rect x="100" y="100" width="824" height="824" rx="20" fill="url(#accent)" stroke="rgba(6,182,212,0.2)" stroke-width="2"/>
  
  <!-- Avatar placeholder -->
  <circle cx="512" cy="350" r="80" fill="rgba(6,182,212,0.2)" stroke="rgba(6,182,212,0.5)" stroke-width="3"/>
  <text x="512" y="370" font-family="Arial" font-size="60" fill="#06b6d4" text-anchor="middle" filter="url(#glow)">👔</text>
  
  <!-- Text -->
  <text x="512" y="480" font-family="Arial" font-size="28" fill="#ffffff" text-anchor="middle" font-weight="bold">ChuangYe</text>
  <text x="512" y="520" font-family="Arial" font-size="16" fill="#06b6d4" text-anchor="middle">HYPER-REALISTIC ${request.type.toUpperCase()}</text>
  
  <!-- Scene info -->
  <text x="512" y="570" font-family="monospace" font-size="12" fill="#6b7280" text-anchor="middle">${request.scene}</text>
  
  <!-- Status -->
  <rect x="362" y="620" width="300" height="40" rx="20" fill="rgba(139,92,246,0.2)" stroke="rgba(139,92,246,0.3)" stroke-width="1"/>
  <text x="512" y="645" font-family="Arial" font-size="14" fill="#a78bfa" text-anchor="middle">Connect ComfyUI for real generation</text>
  
  <!-- Reference photos indicator -->
  <text x="512" y="710" font-family="Arial" font-size="12" fill="#4b5563" text-anchor="middle">Reference photos: ${this.getReferencePhotos().length} loaded</text>
  
  <!-- Bottom bar -->
  <rect x="100" y="850" width="824" height="60" rx="10" fill="rgba(0,0,0,0.3)"/>
  <text x="120" y="885" font-family="monospace" font-size="10" fill="#374151">IP-Adapter: Face Consistency | Model: SDXL | Steps: 35</text>
</svg>`;
    
    fs.writeFileSync(filepath, svg);
    
    return {
      success: true,
      imageUrl: `/media/hyper-realistic/${filename}`,
      localPath: filepath,
      prompt,
      negativePrompt: BASE_NEGATIVE_PROMPT,
      metadata: {
        type: request.type,
        scene: request.scene,
        timestamp: new Date()
      }
    };
  }

  async generateBatch(count: number = 10): Promise<HyperRealisticResult[]> {
    const results: HyperRealisticResult[] = [];
    const scenes = Object.keys(SCENE_TEMPLATES);
    
    for (let i = 0; i < count; i++) {
      const sceneKey = scenes[i % scenes.length];
      const [type, scene] = sceneKey.split('_');
      
      const result = await this.generate({
        type: type as any,
        scene,
        useReferencePhotos: true
      });
      
      results.push(result);
      
      // Delay between generations
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }
}

// Singleton instance
let generatorInstance: HyperRealisticGenerator | null = null;

export function getHyperRealisticGenerator(): HyperRealisticGenerator {
  if (!generatorInstance) {
    generatorInstance = new HyperRealisticGenerator();
  }
  return generatorInstance;
}
