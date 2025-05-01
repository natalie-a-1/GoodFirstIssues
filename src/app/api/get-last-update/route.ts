import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const timestamp = await kv.get<string>('last_cron_update_timestamp');
    
    if (!timestamp) {
      return NextResponse.json({ lastUpdated: null }, { status: 404 });
    }
    
    return NextResponse.json({ lastUpdated: timestamp });
  } catch (error) {
    console.error('Error fetching timestamp from Vercel KV:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last update time' }, 
      { status: 500 }
    );
  }
} 