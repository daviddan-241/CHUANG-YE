import { NextRequest, NextResponse } from 'next/server';
import { getScheduler } from '@/lib/services/scheduler';

export async function GET(request: NextRequest) {
  try {
    const scheduler = getScheduler();
    const jobs = scheduler.getAllJobs();
    const stats = scheduler.getStats();

    return NextResponse.json({
      success: true,
      jobs,
      stats,
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      platform,
      accountId,
      payload,
      scheduledAt,
      maxRetries,
    } = body;

    if (!type || !platform || !accountId || !payload || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const scheduler = getScheduler();
    const job = scheduler.addJob({
      type,
      platform,
      accountId,
      payload,
      scheduledAt: new Date(scheduledAt),
      maxRetries,
    });

    return NextResponse.json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const scheduler = getScheduler();
    const success = scheduler.removeJob(jobId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Job not found or cannot be removed' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Scheduler API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
