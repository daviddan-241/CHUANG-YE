import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ConsistencyCheckResult {
  isDuplicate: boolean;
  isOnBrand: boolean;
  adjustedText: string;
  hash: string;
  issues: string[];
}

interface PersonaStyle {
  name: string;
  tone: string;
  vocabulary: string[];
  emojiStyle: string[];
  sentenceLength: { min: number; max: number };
  preferredPhrases: string[];
  avoidedPhrases: string[];
}

const PERSONA_STYLES: Record<string, PersonaStyle> = {
  ChuangYe: {
    name: 'ChuangYe',
    tone: 'professional, authoritative, data-driven',
    vocabulary: ['strategy', 'framework', 'leverage', 'optimize', 'scale', 'metrics', 'ROI', 'growth'],
    emojiStyle: ['📊', '📈', '💼', '🎯', '✅', '🔑', '💡', '🚀'],
    sentenceLength: { min: 10, max: 25 },
    preferredPhrases: [
      'Based on my experience',
      'The data shows',
      'Here\'s the framework',
      'Let me break this down',
      'The key insight is'
    ],
    avoidedPhrases: [
      'OMG', 'literally', 'like', 'totally', 'no cap', 'fr fr',
      'slay', 'bussin', 'rizz'
    ]
  },
  VelocityEdge: {
    name: 'VelocityEdge',
    tone: 'energetic, motivational, direct',
    vocabulary: ['crush', 'dominate', 'hustle', 'grind', 'win', 'level up', 'boss', 'king'],
    emojiStyle: ['🔥', '💪', '⚡', '🏆', '💰', '🎯', '🙌', '✨'],
    sentenceLength: { min: 8, max: 20 },
    preferredPhrases: [
      'Let\'s go!',
      'No excuses',
      'Time to level up',
      'Stop scrolling',
      'This changed everything'
    ],
    avoidedPhrases: [
      'perhaps', 'maybe', 'might', 'consider', 'possibly',
      'it depends', 'on the other hand'
    ]
  }
};

export class ConsistencyChecker {
  private persona: PersonaStyle;

  constructor(personaName: string = 'ChuangYe') {
    this.persona = PERSONA_STYLES[personaName] || PERSONA_STYLES.ChuangYe;
  }

  async check(text: string, platform: string): Promise<ConsistencyCheckResult> {
    const issues: string[] = [];
    
    // Generate content hash
    const hash = this.generateHash(text);
    
    // Check for duplicates
    const isDuplicate = await this.checkDuplicate(hash);
    if (isDuplicate) {
      issues.push('Duplicate content detected');
    }
    
    // Check tone consistency
    const toneIssues = this.checkTone(text);
    issues.push(...toneIssues);
    
    // Check emoji usage
    const emojiIssues = this.checkEmojiUsage(text);
    issues.push(...emojiIssues);
    
    // Check sentence length
    const sentenceIssues = this.checkSentenceLength(text);
    issues.push(...sentenceIssues);
    
    // Adjust text to match persona
    const adjustedText = this.adjustText(text);
    
    return {
      isDuplicate,
      isOnBrand: issues.length === 0,
      adjustedText,
      hash,
      issues
    };
  }

  private generateHash(text: string): string {
    // Normalize text before hashing
    const normalized = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }

  private async checkDuplicate(hash: string): Promise<boolean> {
    try {
      const existing = await prisma.post.findUnique({
        where: { hash }
      });
      return !!existing;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return false;
    }
  }

  private checkTone(text: string): string[] {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Check for avoided phrases
    for (const phrase of this.persona.avoidedPhrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        issues.push(`Contains avoided phrase: "${phrase}"`);
      }
    }
    
    // Check for preferred phrases (at least one should be present)
    const hasPreferredPhrase = this.persona.preferredPhrases.some(
      phrase => lowerText.includes(phrase.toLowerCase())
    );
    
    if (!hasPreferredPhrase && text.length > 100) {
      issues.push('Missing preferred persona phrases');
    }
    
    return issues;
  }

  private checkEmojiUsage(text: string): string[] {
    const issues: string[] = [];
    
    // Count emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/gu;
    const emojis = text.match(emojiRegex) || [];
    
    // Max 3 emojis per post
    if (emojis.length > 3) {
      issues.push(`Too many emojis (${emojis.length}/3 max)`);
    }
    
    // Check if emojis match persona style
    const personaEmojiSet = new Set(this.persona.emojiStyle);
    const usedNonPersonaEmojis = emojis.filter(e => !personaEmojiSet.has(e));
    
    if (usedNonPersonaEmojis.length > 1) {
      issues.push('Emojis don\'t match persona style');
    }
    
    return issues;
  }

  private checkSentenceLength(text: string): string[] {
    const issues: string[] = [];
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const wordCount = sentence.trim().split(/\s+/).length;
      
      if (wordCount < this.persona.sentenceLength.min) {
        // Short sentences are okay occasionally
        continue;
      }
      
      if (wordCount > this.persona.sentenceLength.max) {
        issues.push(`Sentence too long (${wordCount} words)`);
      }
    }
    
    return issues;
  }

  private adjustText(text: string): string {
    let adjusted = text;
    
    // Replace avoided phrases with preferred ones
    for (const phrase of this.persona.avoidedPhrases) {
      const regex = new RegExp(phrase, 'gi');
      if (regex.test(adjusted)) {
        const replacement = this.persona.preferredPhrases[
          Math.floor(Math.random() * this.persona.preferredPhrases.length)
        ];
        adjusted = adjusted.replace(regex, replacement);
      }
    }
    
    // Limit emojis to 3
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}]/gu;
    const emojis = adjusted.match(emojiRegex) || [];
    
    if (emojis.length > 3) {
      // Remove excess emojis
      let count = 0;
      adjusted = adjusted.replace(emojiRegex, (match) => {
        count++;
        return count <= 3 ? match : '';
      });
    }
    
    // Randomize persona-specific emojis
    const personaEmoji = this.persona.emojiStyle[
      Math.floor(Math.random() * this.persona.emojiStyle.length)
    ];
    
    // Add persona emoji at the beginning if not present
    if (!adjusted.match(emojiRegex)?.some(e => this.persona.emojiStyle.includes(e))) {
      adjusted = personaEmoji + ' ' + adjusted;
    }
    
    return adjusted;
  }

  async savePostHash(hash: string, brandId: string, platform: string): Promise<void> {
    try {
      // This would be called after successful posting
      console.log(`Saving post hash: ${hash} for brand ${brandId}`);
    } catch (error) {
      console.error('Failed to save post hash:', error);
    }
  }

  getPersonaStyle(): PersonaStyle {
    return this.persona;
  }

  setPersona(personaName: string): void {
    this.persona = PERSONA_STYLES[personaName] || PERSONA_STYLES.ChuangYe;
  }
}

export async function checkConsistency(text: string, platform: string, persona: string = 'ChuangYe'): Promise<ConsistencyCheckResult> {
  const checker = new ConsistencyChecker(persona);
  return checker.check(text, platform);
}
