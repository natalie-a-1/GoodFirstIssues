import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic';

/**
 * This endpoint checks if the timestamp was successfully stored in Vercel KV
 */
export async function GET() {
  try {
    // Retrieve the stored timestamp
    const timestamp = await kv.get<string>('last_cron_update_timestamp');
    
    if (!timestamp) {
      return NextResponse.json({ 
        success: false, 
        message: 'No timestamp found. Please run the test-cron endpoint first.' 
      }, { status: 404 });
    }
    
    // Get current time to show difference
    const now = new Date();
    const storedDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - storedDate.getTime()) / 1000);
    
    return NextResponse.json({
      success: true,
      timestamp,
      formattedTimestamp: storedDate.toLocaleString(),
      secondsAgo: diffInSeconds,
      message: `Timestamp successfully retrieved! The cron job last ran ${diffInSeconds} seconds ago.`
    });
  } catch (error) {
    console.error('Error retrieving timestamp from KV:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 