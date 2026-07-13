import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const checks: Record<string, string> = {};

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'connected';
  } catch {
    checks.database = 'error';
  }

  // Groq AI
  checks.ai = process.env.GROQ_API_KEY ? 'configured' : 'not configured (set GROQ_API_KEY)';

  // Telegram
  checks.telegram =
    process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH
      ? 'api credentials present'
      : 'not configured (set TELEGRAM_API_ID + TELEGRAM_API_HASH)';

  // Playwright
  checks.playwright = process.env.PLAYWRIGHT_BROWSERS_PATH
    ? `path: ${process.env.PLAYWRIGHT_BROWSERS_PATH}`
    : 'default path';

  const allOk = checks.database === 'connected';

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone,
      services: checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
