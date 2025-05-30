import { NextResponse } from 'next/server';
// Remove unused imports
// import { promises as fs } from 'fs';
// import path from 'path';
import { fetchIssues } from '@/lib/fetch-issues';
import { kv } from '@vercel/kv'; // Import Vercel KV

export const dynamic = 'force-dynamic';

// This endpoint handles Vercel cron job requests
export async function GET(request: Request) {
  // Verify the Vercel cron job secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Check if the secret is missing entirely, which might happen in development
    if (!process.env.CRON_SECRET && process.env.NODE_ENV === 'development') {
      console.warn('CRON_SECRET is not set. Allowing request in development mode.');
    } else {
      return new Response('Unauthorized', {
        status: 401,
      });
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