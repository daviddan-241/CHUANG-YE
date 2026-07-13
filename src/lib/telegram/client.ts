/**
 * Real Telegram user client using GramJS (MTProto)
 * Supports phone-number login → SMS code → session string
 */
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TelegramAuthState {
  step: 'idle' | 'code_sent' | 'authenticated';
  phone?: string;
  phoneCodeHash?: string;
  session?: string;
}

// In-memory store for pending auth (per brandId)
const authStates = new Map<string, TelegramAuthState>();

function getApiCreds() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID || '0', 10);
  const apiHash = process.env.TELEGRAM_API_HASH || '';
  if (!apiId || !apiHash) {
    throw new Error('TELEGRAM_API_ID and TELEGRAM_API_HASH must be set. Get them from https://my.telegram.org');
  }
  return { apiId, apiHash };
}

/**
 * Step 1 – send verification code to phone number
 */
export async function sendTelegramCode(brandId: string, phone: string): Promise<{ phoneCodeHash: string }> {
  const { apiId, apiHash } = getApiCreds();
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  const result = await client.sendCode({ apiId, apiHash }, phone);
  const phoneCodeHash = result.phoneCodeHash;

  // Store in memory while we wait for the code
  authStates.set(brandId, { step: 'code_sent', phone, phoneCodeHash });

  // Disconnect – user will reconnect with the code
  await client.disconnect();

  return { phoneCodeHash };
}

/**
 * Step 2 – verify the SMS code and save the session
 */
export async function verifyTelegramCode(
  brandId: string,
  code: string,
  password?: string // 2FA password if enabled
): Promise<{ session: string }> {
  const { apiId, apiHash } = getApiCreds();
  const state = authStates.get(brandId);
  if (!state || state.step !== 'code_sent' || !state.phone || !state.phoneCodeHash) {
    throw new Error('No pending auth state. Call sendCode first.');
  }

  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  await client.signInUser(
    { apiId, apiHash },
    {
      phoneNumber: state.phone,
      phoneCode: async () => code,
      password: password ? async () => password : undefined,
      onError: (err: Error) => { throw err; },
    }
  );

  const session = client.session.save() as unknown as string;
  await client.disconnect();

  // Persist session in DB for this brand
  const brand = await prisma.brand.findFirst({ where: { id: brandId } });
  if (brand) {
    await prisma.session.upsert({
      where: { brandId_platform: { brandId, platform: 'telegram' } },
      update: {
        cookieJson: session,
        localStorage: '{}',
        userAgent: `TelegramClient/${apiId}`,
        viewport: '{"width":0,"height":0}',
      },
      create: {
        brandId,
        platform: 'telegram',
        cookieJson: session,
        localStorage: '{}',
        userAgent: `TelegramClient/${apiId}`,
        viewport: '{"width":0,"height":0}',
      },
    });
  }

  authStates.set(brandId, { step: 'authenticated', session });
  return { session };
}

/**
 * Get a connected TelegramClient using stored session
 */
export async function getTelegramClient(brandId: string): Promise<TelegramClient> {
  const { apiId, apiHash } = getApiCreds();

  const dbSession = await prisma.session.findUnique({
    where: { brandId_platform: { brandId, platform: 'telegram' } },
  });

  if (!dbSession) {
    throw new Error(`No Telegram session for brand ${brandId}. Please authenticate first.`);
  }

  const client = new TelegramClient(
    new StringSession(dbSession.cookieJson),
    apiId,
    apiHash,
    { connectionRetries: 5 }
  );

  await client.connect();
  return client;
}

/**
 * Send a message to a Telegram group/channel/user
 */
export async function sendTelegramMessage(
  brandId: string,
  target: string, // username, phone, or chat ID
  message: string
): Promise<boolean> {
  try {
    const client = await getTelegramClient(brandId);
    await client.sendMessage(target, { message, parseMode: 'html' });
    await client.disconnect();
    return true;
  } catch (err) {
    console.error('Telegram send error:', err);
    return false;
  }
}

/**
 * Check if a brand has an active Telegram session
 */
export async function hasTelegramSession(brandId: string): Promise<boolean> {
  const dbSession = await prisma.session.findUnique({
    where: { brandId_platform: { brandId, platform: 'telegram' } },
  });
  return !!dbSession?.cookieJson;
}

/**
 * Get auth state for a brand
 */
export function getTelegramAuthState(brandId: string): TelegramAuthState {
  return authStates.get(brandId) || { step: 'idle' };
}

/**
 * Revoke session
 */
export async function revokeTelegramSession(brandId: string): Promise<void> {
  try {
    const client = await getTelegramClient(brandId);
    await client.invoke({ _: 'auth.logOut' } as any);
    await client.disconnect();
  } catch (_) { /* already logged out */ }

  await prisma.session.deleteMany({
    where: { brandId, platform: 'telegram' },
  });
  authStates.delete(brandId);
}
