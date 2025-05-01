import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// This prevents the API from being called by unauthorized sources
// It checks for the Authorization header with a secret token
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Execute the Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_issues.py');
    
    // Run the python script
    const { stdout, stderr } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(`python ${scriptPath}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      });
    });

    // Update the timestamp file to track when the last update happened
    const now = new Date();
    await fs.writeFile(
      path.join(process.cwd(), 'public', 'last-update.json'),
      JSON.stringify({ lastUpdated: now.toISOString() })
    );

    return NextResponse.json({
      success: true,
      message: 'Issues updated successfully',
      timestamp: now.toISOString(),
      stdout,
      stderr,
    });
  } catch (error) {
    console.error('Error updating issues:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 