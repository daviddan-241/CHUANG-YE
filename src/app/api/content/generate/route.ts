import { NextRequest, NextResponse } from 'next/server';
import { getContentGenerator } from '@/lib/services/contentGenerator';
import { getImageGenerator } from '@/lib/services/imageGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic,
      platform = 'twitter',
      style = 'professional',
      tone = 'authoritative',
      length = 'medium',
      includeHashtags = true,
      includeEmojis = true,
      targetAudience,
      callToAction,
      generateImage = false,
    } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate content
    const contentGenerator = getContentGenerator();
    const content = await contentGenerator.generate({
      topic,
      platform,
      style,
      tone,
      length,
      includeHashtags,
      includeEmojis,
      targetAudience,
      callToAction,
    });

    // Generate image if requested
    let image = null;
    if (generateImage) {
      const imageGenerator = getImageGenerator();
      const imageResult = await imageGenerator.generateFromPost(content.content, style);
      
      if (imageResult.success) {
        image = {
          url: imageResult.imageUrl,
          prompt: imageResult.metadata?.prompt,
        };
      }
    }

    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        text: content.content,
        hashtags: content.hashtags,
        imagePrompt: content.imagePrompt,
        metadata: content.metadata,
      },
      image,
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
