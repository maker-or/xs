// File: /src/app/api/auth/check/route.ts

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get authentication data from Clerk
    const { userId } = await auth();

    // Return authentication status
    return NextResponse.json({
      isSignedIn: !!userId,
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json(
      {
        isSignedIn: false,
        error: 'Failed to check authentication',
      },
      { status: 500 }
    );
  }
}
