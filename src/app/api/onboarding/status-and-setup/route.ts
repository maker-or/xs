import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';

export async function POST(request: Request) {
  try {
    // Get authentication data from Clerk
    const { userId: authUserId, sessionClaims } = await auth();

    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const requestBody = await request.json();
    const { email, organisationId, role: requestRole, userType } = requestBody;

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
        userType: userType || 'college_user', // Include user type in response
        message: 'User already onboarded',
      });
    }

    // New user - create their account
    // Enhanced role determination logic
    let finalRole = 'member'; // Default role

    // Priority order for role determination:
    // 1. From request body (passed from organization invitation)
    // 2. From Clerk session claims (organization role)
    // 3. Default to 'member'
    if (requestRole) {
      // Map common organization roles to our system roles
      const roleMapping: { [key: string]: string } = {
        admin: 'admin',
        'org:admin': 'admin',
        teacher: 'admin',
        member: 'member',
        'org:member': 'member',
        student: 'member',
      };

      finalRole = roleMapping[requestRole.toLowerCase()] || 'member';
    } else if (sessionClaims?.org_role) {
      // Fallback to session claims
      finalRole = sessionClaims.org_role === 'admin' ? 'admin' : 'member';
    }

    // Enhanced organization ID resolution
    let finalOrgId = 'default-org'; // Fallback

    // Priority order for organization ID:
    // 1. From request body (most reliable for invitations)
    // 2. From session claims (current active organization)
    // 3. Default fallback
    if (organisationId && organisationId !== 'default-org') {
      finalOrgId = organisationId;
    } else if (sessionClaims?.org_id) {
      finalOrgId = sessionClaims.org_id;
    }

    console.log('Organization and role resolution:', {
      fromRequest: { organisationId, role: requestRole },
      fromSession: {
        org_id: sessionClaims?.org_id,
        org_role: sessionClaims?.org_role,
      },
      finalValues: { organisationId: finalOrgId, role: finalRole },
      userEmail: Array.isArray(email) ? email[0]?.emailAddress : email,
    });

    // Enhanced email processing
    let emailValue = '';

    if (email) {
      if (Array.isArray(email)) {
        // Handle Clerk email array format
        if (email.length > 0) {
          const primaryEmail = email.find((e) => e.id) || email[0];
          emailValue = primaryEmail?.emailAddress || primaryEmail?.email || '';
        }
      } else if (typeof email === 'string') {
        emailValue = email;
      } else if (email && typeof email === 'object') {
        emailValue = email.emailAddress || email.email || '';
      }
    }

    // Fallback email generation if needed
    if (!emailValue) {
      emailValue = `${authUserId}@unknown.com`;
      console.log('No email found, using fallback:', emailValue);
    }

    // Create new user record
    const newUser = await db
      .insert(users)
      .values({
        userid: authUserId,
        email: emailValue,
        organisation_id: finalOrgId,
        role: finalRole,
        created_at: new Date(),
      })
      .returning();

    if (!newUser.length) {
      throw new Error('Failed to create user record');
    }

    console.log('Successfully created user:', {
      userId: authUserId,
      email: emailValue,
      organisationId: finalOrgId,
      role: finalRole,
    });

    return NextResponse.json({
      isExistingUser: false,
      role: finalRole,
      organisationId: finalOrgId,
      userType: userType || 'college_user', // Include user type in response
      message: 'User successfully onboarded',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process onboarding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
