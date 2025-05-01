import { NextResponse } from 'next/server';
// Remove unused imports
// import { promises as fs } from 'fs';
// import path from 'path';
import { fetchIssues } from '@/lib/fetch-issues';
import { kv } from '@vercel/kv'; // Import Vercel KV

export const dynamic = 'force-dynamic';

// This endpoint handles both Vercel cron job requests and manual requests with authorization
export async function GET(request: Request) {
  // Check if this is a Vercel cron invocation
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
  
  // For non-Vercel requests, validate the authorization header
  if (!isVercelCron) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    // Fetch issues using our TypeScript function
    console.log('Starting issues fetch process...');
    const { issues, log } = await fetchIssues();
    console.log('Issues fetch completed successfully');
    
    // Define timestamp
    const now = new Date();
    const timestampString = now.toISOString();

    // Save timestamp to Vercel KV
    await kv.set('last_cron_update_timestamp', timestampString);
    console.log('Timestamp saved to Vercel KV');

    return NextResponse.json({
      success: true,
      message: 'Issues updated successfully',
      timestamp: timestampString,
      issueCount: issues.length,
      logs: log
    });
  } catch (error) {
    console.error('Error updating issues:', error);
    
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 