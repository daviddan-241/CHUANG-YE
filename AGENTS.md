# DAVE Social AI - Agent Instructions

This document provides instructions for AI agents working on the DAVE Social AI project.

## Project Overview

DAVE Social AI is a fully automated social media management system with:
- Multi-platform support (Twitter, Telegram, Instagram, Facebook, Xiaohongshu, WeChat, Douyin)
- AI content generation
- Browser automation with Playwright
- Image generation with ComfyUI/Stable Diffusion
- Smart scheduling and engagement

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API routes, Playwright, Prisma (SQLite)
- **State**: Zustand
- **Queue**: BullMQ + Redis (optional)
- **Images**: ComfyUI / Stable Diffusion XL

## Development Guidelines

### Code Style

1. Use TypeScript strict mode
2. Follow existing code patterns
3. Use functional components with hooks
4. Implement proper error handling
5. Add loading states for async operations
6. Use meaningful variable/function names

### Component Structure

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Props definition
}

export default function Component({ prop }: ComponentProps) {
  // State and hooks
  
  // Handlers
  
  // Render
  return (
    <div className="...">
      {/* Content */}
    </div>
  );
}
```

### Styling

- Use Tailwind CSS classes
- Use `cn()` utility for conditional classes
- Follow the dark theme with neon accents (cyan, purple, emerald)
- Use glassmorphism effects (`glass-card` class)
- Add animations with Framer Motion

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Logic
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'message' }, { status: 500 });
  }
}
```

### Browser Automation

- Use the `BrowserAutomation` class from `src/lib/automation/browser.ts`
- Implement human-like behavior (random delays, natural movements)
- Save/restore sessions for persistence
- Handle errors gracefully with retries

### Image Generation

- Use the `ImageGenerator` class from `src/lib/services/imageGenerator.ts`
- Support multiple backends (ComfyUI, SD WebUI, placeholder)
- Generate prompts from post content
- Save images locally

## Key Files

- `/src/app/page.tsx` - Main dashboard
- `/src/components/layout/Sidebar.tsx` - Navigation sidebar
- `/src/lib/automation/browser.ts` - Playwright wrapper
- `/src/lib/services/contentGenerator.ts` - AI content generation
- `/src/lib/services/imageGenerator.ts` - Image generation
- `/src/lib/services/scheduler.ts` - Job scheduling
- `/src/stores/appStore.ts` - Zustand state management

## Common Tasks

### Adding a New Platform

1. Create automation file in `/src/lib/automation/`
2. Implement login, post, reply, like, follow methods
3. Add platform to the platforms list
4. Update UI components

### Creating a New Page

1. Create folder in `/src/app/`
2. Add `page.tsx` with `'use client'` directive
3. Update sidebar navigation in `Sidebar.tsx`
4. Add any needed API routes

### Adding a New Feature

1. Create component in `/src/components/`
2. Add state management if needed
3. Create API routes if needed
4. Update relevant pages
5. Add to sidebar if it's a main feature

## Testing

- Test browser automation in visible mode first
- Verify session persistence
- Check error handling
- Test with multiple platforms

## Deployment

- Use Docker for production
- Set environment variables
- Configure reverse proxy
- Set up SSL certificates
- Monitor logs

## Security Considerations

- Encrypt sensitive data
- Validate user input
- Use environment variables for secrets
- Implement rate limiting
- Log all actions for audit

## Performance Tips

- Use React.memo for expensive components
- Implement pagination for large lists
- Use lazy loading for images
- Cache API responses
- Optimize database queries

## Troubleshooting

### Playwright Issues
- Ensure browsers are installed: `npx playwright install`
- Check for system dependencies
- Try visible mode for debugging

### Image Generation Issues
- Verify ComfyUI is running
- Check API endpoint configuration
- Review generated prompts

### Session Issues
- Check session file permissions
- Verify encryption key
- Clear corrupted sessions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Playwright Documentation](https://playwright.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://zustand-demo.pmnd.rs)
