import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramCode } from '@/lib/telegram/client';

export async function POST(request: NextRequest) {
  try {
    const { brandId, code, password } = await request.json();

    if (!brandId || !code) {
      return NextResponse.json({ error: 'brandId and code are required' }, { status: 400 });
    }

    const { session } = await verifyTelegramCode(brandId, code, password);

    return NextResponse.json({
      success: true,
      message: 'Telegram authenticated successfully',
      sessionActive: true,
    });
  } catch (error: any) {
    console.error('Telegram code verification error:', error);
    return NextResponse.json({ error: error.message || 'Invalid code' }, { status: 500 });
  }
}
