import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get authentication data from Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract org_role from session claims
    const orgRole = sessionClaims?.org_role || null;

    // Determine application role based on Clerk org_role
    const appRole = orgRole === 'admin' ? 'admin' : 'member';

    // Return role information
    return NextResponse.json({
      userId,
      orgRole,
      appRole,
      // Include additional claims from the session token
      sessionClaimsExcerpt: {
        org_id: sessionClaims?.org_id,
        org_slug: sessionClaims?.org_slug,
        org_role: sessionClaims?.org_role,
      },
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve role information' },
      { status: 500 }
    );
  }
}
