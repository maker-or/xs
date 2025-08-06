import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';

export async function GET() {
  try {
    // Get authentication data from Clerk
    const { userId: authUserId } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.userid, authUserId),
    });

    // Return onboarding status with organization ID
    return NextResponse.json({
      isOnboarded: !!existingUser,
      role: existingUser?.role || null,
      organisationId: existingUser?.organisation_id || null,
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
