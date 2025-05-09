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
    
    console.log('Received onboarding request:', {
      requestBody,
      authUserId,
      sessionClaimsExcerpt: {
        org_id: sessionClaims?.org_id,
        org_role: sessionClaims?.org_role
      }
    });
    
    // Automatically determine role from session claims
    // If user has admin role in Clerk org, they are admin, otherwise member/student
    // You can customize this logic based on your Clerk organization setup
    const role = sessionClaims?.org_role === 'admin' ? 'admin' : 'member';
    console.log('Determined role from session claims:', role, sessionClaims);
    
    // Validate required fields
    if (!authUserId || !email || !organisationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // First, check if user already exists to avoid duplicates
    const existingUser = await db.query.users.findFirst({
      where: eq(users.userid, authUserId),
    });

    if (existingUser) {
      // User already exists, no need to add again
      return NextResponse.json(
        { message: 'User already onboarded', role: existingUser.role },
        { status: 200 }
      );
    }

    // Insert new user
    // Handle different email formats (string, array of objects, etc.)
    let emailValue = '';
    
    try {
      if (Array.isArray(email)) {
        // If it's an array of email objects from Clerk
        if (email[0] && email[0].emailAddress) {
          emailValue = email[0].emailAddress;
        } else if (typeof email[0] === 'string') {
          emailValue = email[0];
        }
      } else if (typeof email === 'string') {
        // If it's a simple string
        emailValue = email;
      } else if (email && typeof email === 'object') {
        // If it's a single email object
        emailValue = email.emailAddress || email.email || '';
      }
      
      console.log('Processed email value:', emailValue);
      
      await db.insert(users).values({
        userid: authUserId,
        email: emailValue,
        role: role,
        organisation_id: organisationId || '',
      });
    } catch (insertError) {
      console.error('Error during user insertion:', insertError);
      throw insertError; // Re-throw to be caught by outer try/catch
    }

    // Return success response with role information
    return NextResponse.json(
      { message: 'User onboarded successfully', role },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to onboard user' },
      { status: 500 }
    );
  }
}
