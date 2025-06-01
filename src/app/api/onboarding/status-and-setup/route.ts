import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { auth } from "@clerk/nextjs/server";
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    // Get authentication data from Clerk
    const { userId: authUserId, sessionClaims } = await auth();
    
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const requestBody = await request.json();
    const { email, organisationId } = requestBody;

    // Check if user already exists in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.userid, authUserId),
    });

    if (existingUser) {
      // User already exists, return their info
      return NextResponse.json({
        isExistingUser: true,
        role: existingUser.role,
        organisationId: existingUser.organisation_id,
        message: 'User already onboarded'
      });
    }

    // New user - create their account
    // Determine role from Clerk session claims
    const orgRole = sessionClaims?.org_role;
    const role = orgRole === 'admin' ? 'admin' : 'member';

    // Priority order for organization ID:
    // 1. From request body (signup with invitation)
    // 2. From session claims (Clerk organization)
    // 3. Default fallback
    const finalOrgId = organisationId || sessionClaims?.org_id || 'default-org';

    console.log('Organization ID resolution:', {
      fromRequest: organisationId,
      fromSession: sessionClaims?.org_id,
      finalOrgId,
      userEmail: Array.isArray(email) ? email[0]?.emailAddress : email
    });
    
    // Create new user record
    const newUser = await db.insert(users).values({
      userid: authUserId,
      email: Array.isArray(email) ? email[0]?.emailAddress || '' : email || '',
      organisation_id: finalOrgId,
      role: role,
      created_at: new Date(),
    }).returning();

    if (!newUser.length) {
      throw new Error('Failed to create user record');
    }

    return NextResponse.json({
      isExistingUser: false,
      role: role,
      organisationId: finalOrgId,
      message: 'User successfully onboarded'
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
