import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fetchIssues } from '@/lib/fetch-issues';

async function sendNotificationEmail(success: boolean, message: string, details: string) {
  if (!process.env.NOTIFICATION_EMAIL) {
    console.log('No notification email configured');
    return;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: process.env.NOTIFICATION_EMAIL }]
          }
        ],
        from: { email: 'noreply@yourdomain.com' },
        subject: `Crypto Issues Cron Job: ${success ? 'Success' : 'Failed'}`,
        content: [
          {
            type: 'text/plain',
            value: `${message}\n\nDetails:\n${details}`
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Failed to send notification email:', await response.text());
    }
  } catch (error) {
    console.error('Error sending notification email:', error);
  }
}

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
    
    // Update the timestamp file to track when the last update happened
    const now = new Date();
    await fs.writeFile(
      path.join(process.cwd(), 'public', 'last-update.json'),
      JSON.stringify({ lastUpdated: now.toISOString() })
    );

    // Send success notification
    await sendNotificationEmail(
      true, 
      'Issues updated successfully', 
      `Timestamp: ${now.toISOString()}\n\nNumber of issues: ${issues.length}\n\nLogs:\n${log.join('\n')}`
    );

    return NextResponse.json({
      success: true,
      message: 'Issues updated successfully',
      timestamp: now.toISOString(),
      issueCount: issues.length,
      logs: log
    });
  } catch (error) {
    console.error('Error updating issues:', error);
    
    // Send failure notification
    await sendNotificationEmail(
      false,
      'Error updating issues',
      (error as Error).message
    );
    
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 