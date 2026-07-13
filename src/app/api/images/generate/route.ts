import { NextRequest, NextResponse } from 'next/server';
import { getImageGenerator } from '@/lib/services/imageGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      negativePrompt,
      style,
      width = 1024,
      height = 1024,
      steps = 30,
      cfgScale = 7,
      seed,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const imageGenerator = getImageGenerator();
    const result = await imageGenerator.generate({
      prompt,
      negativePrompt,
      style,
      width,
      height,
      steps,
      cfgScale,
      seed,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        image: {
          url: result.imageUrl,
          localPath: result.localPath,
          metadata: result.metadata,
        },
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Image generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
