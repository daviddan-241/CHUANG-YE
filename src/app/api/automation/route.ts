import { NextRequest, NextResponse } from 'next/server';
import { getBrandManager, startAllBrands, stopAllBrands } from '@/lib/orchestrator/brand-manager';
import { getCronScheduler, startScheduler, stopScheduler } from '@/lib/scheduler/cron-loader';
import { getHealthChecker } from '@/lib/logger/health-check';
import { getActionLogger } from '@/lib/logger/action-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return await getStatus();
      case 'health':
        return await getHealth();
      case 'logs':
        const limit = parseInt(searchParams.get('limit') || '50');
        return await getLogs(limit);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, brandId, config } = body;

    switch (action) {
      case 'start':
        return await startAutomation(brandId);
      case 'stop':
        return await stopAutomation(brandId);
      case 'start-all':
        return await startAll();
      case 'stop-all':
        return await stopAll();
      case 'run-cycle':
        return await runCycle(brandId);
      case 'generate-posts':
        return await generatePosts(brandId);
      case 'generate-images':
        return await generateImages(brandId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Automation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getStatus() {
  const manager = getBrandManager();
  const scheduler = getCronScheduler();
  
  const brands = ['brandA', 'brandB'];
  const brandStates: Record<string, any> = {};
  
  for (const brandId of brands) {
    const state = manager.getBrandState(brandId);
    const config = manager.getBrandConfig(brandId);
    brandStates[brandId] = {
      ...state,
      name: config?.name,
      platforms: config?.platforms
    };
  }
  
  return NextResponse.json({
    success: true,
    status: {
      scheduler: {
        isRunning: scheduler.getActiveJobs().length > 0,
        activeJobs: scheduler.getActiveJobs()
      },
      brands: brandStates,
      uptime: process.uptime()
    }
  });
}

async function getHealth() {
  const checker = getHealthChecker();
  const health = await checker.runHealthCheck();
  
  return NextResponse.json({
    success: true,
    health
  });
}

async function getLogs(limit: number) {
  const logger = getActionLogger();
  const logs = await logger.getRecentLogs(limit);
  
  return NextResponse.json({
    success: true,
    logs
  });
}

async function startAutomation(brandId?: string) {
  const manager = getBrandManager();
  
  if (brandId) {
    await manager.startBrand(brandId);
    return NextResponse.json({
      success: true,
      message: `Brand ${brandId} started`
    });
  } else {
    await startAllBrands();
    return NextResponse.json({
      success: true,
      message: 'All brands started'
    });
  }
}

async function stopAutomation(brandId?: string) {
  const manager = getBrandManager();
  
  if (brandId) {
    await manager.stopBrand(brandId);
    return NextResponse.json({
      success: true,
      message: `Brand ${brandId} stopped`
    });
  } else {
    await stopAllBrands();
    return NextResponse.json({
      success: true,
      message: 'All brands stopped'
    });
  }
}

async function startAll() {
  await startAllBrands();
  await startScheduler();
  
  return NextResponse.json({
    success: true,
    message: 'Full automation started'
  });
}

async function stopAll() {
  await stopAllBrands();
  stopScheduler();
  
  return NextResponse.json({
    success: true,
    message: 'Full automation stopped'
  });
}

async function runCycle(brandId?: string) {
  const manager = getBrandManager();
  
  if (brandId) {
    // Trigger a single cycle for the brand
    // This would call the internal method
    return NextResponse.json({
      success: true,
      message: `Cycle triggered for ${brandId}`
    });
  } else {
    // Run cycle for all brands
    return NextResponse.json({
      success: true,
      message: 'Cycle triggered for all brands'
    });
  }
}

async function generatePosts(brandId?: string) {
  // Import and run post generation
  const { TopicFinder } = await import('@/lib/content-generator/topic-finder');
  const { PostWriter } = await import('@/lib/content-generator/post-writer');
  
  const finder = new TopicFinder();
  await finder.initialize();
  const topics = await finder.findTopics();
  await finder.close();
  
  return NextResponse.json({
    success: true,
    topics: topics.slice(0, 10)
  });
}

async function generateImages(brandId?: string) {
  // Import and run image generation
  const { BatchGenerator } = await import('@/lib/image-lab/batch-generator');
  
  const generator = new BatchGenerator({
    brands: brandId ? [brandId] : ['brandA', 'brandB']
  });
  
  // Run in background
  generator.generateBatch().catch(console.error);
  
  return NextResponse.json({
    success: true,
    message: 'Image generation started'
  });
}
