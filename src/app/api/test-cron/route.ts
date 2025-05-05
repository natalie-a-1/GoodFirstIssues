import { NextResponse } from 'next/server';
import { fetchIssues } from '@/lib/fetch-issues';
import { kv } from '@vercel/kv'; // Import Vercel KV

export const dynamic = 'force-dynamic';

/**
 * This endpoint allows you to manually trigger the cron job functionality locally
 * It mimics what the Vercel cron job would do in production
 */
export async function GET() {
  try {
    console.log('Starting manual cron job test...');
    
    // Fetch issues using our TypeScript function
    console.log('Starting issues fetch process...');
    const { issues, log } = await fetchIssues();
    console.log('Issues fetch completed successfully');
    
    // Define timestamp
    const now = new Date();
    const timestampString = now.toISOString();

    // Save timestamp to Vercel KV
    await kv.set('last_cron_update_timestamp', timestampString);
    console.log('Timestamp saved to Vercel KV:', timestampString);

    // Return response
    return NextResponse.json({
      success: true,
      message: 'Cron job test executed successfully',
      timestamp: timestampString,
      issueCount: issues.length,
      logs: log
    });
  } catch (error) {
    console.error('Error executing test cron job:', error);
    
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 