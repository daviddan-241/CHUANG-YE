import { NextRequest, NextResponse } from 'next/server';
import { hasTelegramSession, getTelegramAuthState } from '@/lib/telegram/client';

export async function GET(request: NextRequest) {
  try {
    const brandId = request.nextUrl.searchParams.get('brandId') || 'default';
    const connected = await hasTelegramSession(brandId);
    const state = getTelegramAuthState(brandId);

    return NextResponse.json({ connected, step: state.step });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
