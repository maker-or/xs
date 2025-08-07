import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const url = new URL(request.url);

    // Get all URL parameters
    const params = Object.fromEntries(url.searchParams.entries());

    return NextResponse.json({
      debug: {
        userId,
        sessionClaims,
        urlParams: params,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, sessionClaims } = await auth();
    const body = await request.json();

    return NextResponse.json({
      debug: {
        userId,
        sessionClaims,
        requestBody: body,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug endpoint failed' },
      { status: 500 }
    );
  }
}
