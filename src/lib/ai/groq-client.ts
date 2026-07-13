/**
 * Free AI via Groq — llama-3.3-70b-versatile
 * Sign up free at https://console.groq.com
 * No cost, very fast inference
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant'; // for quick responses

export async function groqChat(
  messages: GroqMessage[],
  options: GroqOptions = {}
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set. Get a free key at https://console.groq.com');
  }

  const { model = DEFAULT_MODEL, temperature = 0.8, maxTokens = 1024 } = options;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() ?? '';
}

/**
 * Generate a social media post using free Groq AI
 */
export async function generateSocialPost(params: {
  topic: string;
  platform: string;
  style: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  language?: 'en' | 'zh' | 'bilingual';
  cta?: string;
  audience?: string;
}): Promise<string> {
  const {
    topic,
    platform,
    style,
    tone,
    length,
    language = 'en',
    cta,
    audience,
  } = params;

  const charLimits: Record<string, number> = {
    short: 150,
    medium: 300,
    long: 600,
  };

  const langInstruction =
    language === 'zh'
      ? 'Write entirely in Simplified Chinese (zh-CN).'
      : language === 'bilingual'
      ? 'Write with key phrases in both English and Simplified Chinese.'
      : 'Write in English.';

  const systemPrompt = `You are a top social media content expert specializing in monetization and engagement for ${platform}. 
You create posts that get real engagement and drive DMs and sales.
${langInstruction}
Style: ${style}. Tone: ${tone}.
Keep under ${charLimits[length]} characters for the main text (before hashtags).
Do NOT use placeholder text like [Step 1] — write the actual content.
Include specific, believable revenue figures in CNY or USD to build credibility.
Use 2-4 relevant emojis max. Sound human, not robotic.`;

  const userPrompt = `Write a ${platform} post about: "${topic}"
${audience ? `Target audience: ${audience}` : ''}
${cta ? `Call to action: ${cta}` : 'Add a strong CTA to DM or comment'}
Make it feel personal, authentic, and credibility-building.
Include a real result or transformation story.`;

  return groqChat(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { model: DEFAULT_MODEL, temperature: 0.85, maxTokens: 800 }
  );
}

/**
 * Generate an AI reply to a DM trigger word
 */
export async function generateDMReply(params: {
  incomingMessage: string;
  brandPersona: string;
  productLink: string;
  language?: 'en' | 'zh';
}): Promise<string> {
  const { incomingMessage, brandPersona, productLink, language = 'zh' } = params;

  const langInstr =
    language === 'zh'
      ? 'Reply in Simplified Chinese, warm and natural.'
      : 'Reply in English, warm and natural.';

  return groqChat(
    [
      {
        role: 'system',
        content: `You are ${brandPersona}, a successful entrepreneur helping people with passive income and side hustles. ${langInstr} Keep replies under 100 words. Be helpful and genuine. Always include the resource link once naturally.`,
      },
      {
        role: 'user',
        content: `Someone sent: "${incomingMessage}". Reply warmly and include this link: ${productLink}`,
      },
    ],
    { model: FAST_MODEL, temperature: 0.7, maxTokens: 200 }
  );
}

/**
 * Generate hashtags for a post
 */
export async function generateHashtags(topic: string, platform: string, count = 10): Promise<string[]> {
  const text = await groqChat(
    [
      {
        role: 'system',
        content: `Generate ${count} trending hashtags for ${platform} about the given topic. Return only the hashtags, one per line, starting with #. No explanation.`,
      },
      { role: 'user', content: topic },
    ],
    { model: FAST_MODEL, temperature: 0.6, maxTokens: 200 }
  );

  return text
    .split('\n')
    .map((h) => h.trim())
    .filter((h) => h.startsWith('#'))
    .slice(0, count);
}

/**
 * Translate content to Chinese
 */
export async function translateToZh(text: string): Promise<string> {
  return groqChat(
    [
      { role: 'system', content: 'Translate the following to natural, engaging Simplified Chinese (zh-CN). Keep emojis and formatting. Return only the translation.' },
      { role: 'user', content: text },
    ],
    { model: FAST_MODEL, temperature: 0.3, maxTokens: 600 }
  );
}
