import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramCode } from '@/lib/telegram/client';

export async function POST(request: NextRequest) {
  try {
    const { brandId, phone } = await request.json();

    if (!brandId || !phone) {
      return NextResponse.json({ error: 'brandId and phone are required' }, { status: 400 });
    }

    if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
      return NextResponse.json(
        { error: 'TELEGRAM_API_ID and TELEGRAM_API_HASH not configured. Get them from https://my.telegram.org' },
        { status: 500 }
      );
    }

    const { phoneCodeHash } = await sendTelegramCode(brandId, phone);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${phone}`,
      phoneCodeHash,
    });
  } catch (error: any) {
    console.error('Telegram phone auth error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send code' }, { status: 500 });
  }
}
