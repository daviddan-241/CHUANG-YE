import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram/client';

export async function POST(request: NextRequest) {
  try {
    const { brandId, target, message } = await request.json();

    if (!brandId || !target || !message) {
      return NextResponse.json({ error: 'brandId, target, and message are required' }, { status: 400 });
    }

    const ok = await sendTelegramMessage(brandId, target, message);

    if (!ok) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent' });
  } catch (error: any) {
    console.error('Telegram send error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send' }, { status: 500 });
  }
}
