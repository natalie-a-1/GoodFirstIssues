import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

interface Issue {
  id: number;
  title: string;
  url: string;
  repository: string;
  tags: string[];
  created_at: string;
  number: number;
  stars?: number;
  forks?: number;
}

export async function GET() {
  try {
    const issues = await kv.get<Issue[]>('all_issues_data');

    if (!issues) {
      // Issues haven't been populated yet, or KV store is empty for this key
      return NextResponse.json({ issues: [], message: 'No issues found or KV store is empty for this key.' }, { status: 200 });
    }

    return NextResponse.json({ issues });
  } catch (error) {
    console.error('Error fetching issues from Vercel KV:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch issues from KV.', details: errorMessage }, { status: 500 });
  }
} 