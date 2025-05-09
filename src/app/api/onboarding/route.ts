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
    
    // Use the organisationId from the request if available, otherwise try to get it from sessionClaims
    const finalOrgId = organisationId || sessionClaims?.org_id || '';
    
    console.log('Organization ID from request:', organisationId);
    console.log('Organization ID from session claims:', sessionClaims?.org_id);
    console.log('Final organization ID to be used:', finalOrgId);
    
    console.log('Received onboarding request:', {
      requestBody,
      authUserId,
      sessionClaimsExcerpt: {
        org_id: sessionClaims?.org_id,
        org_role: sessionClaims?.org_role
      },
      resolvedOrgId: finalOrgId
    });
    
    // Automatically determine role from session claims
    // If user has admin role in Clerk org, they are admin, otherwise member/student
    // You can customize this logic based on your Clerk organization setup
    const role = sessionClaims?.org_role === 'admin' ? 'admin' : 'member';
    console.log('Determined role from session claims:', role, sessionClaims);
    
    // Validate required fields - only authUserId is truly required as we can work around the others
    if (!authUserId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }
    
    // No validation needed for email and organisationId as we have fallbacks for both

    // First, check if user already exists to avoid duplicates
    const existingUser = await db.query.users.findFirst({
      where: eq(users.userid, authUserId),
    });

    if (existingUser) {
      // User already exists, no need to add again
      console.log('User already exists with organization ID:', existingUser.organisation_id);
      return NextResponse.json(
        { 
          message: 'User already onboarded', 
          role: existingUser.role,
          organisationId: existingUser.organisation_id 
        },
        { status: 200 }
      );
    }

    // Insert new user
    // Handle different email formats (string, array of objects, etc.) or fetch from Clerk if needed
    let emailValue = '';
    
    try {
      // Try to extract email from provided data
      if (email) {
        if (Array.isArray(email)) {
          // If it's an array of email objects from Clerk
          if (email.length > 0) {
            if (email[0] && email[0].emailAddress) {
              emailValue = email[0].emailAddress;
            } else if (typeof email[0] === 'string') {
              emailValue = email[0];
            } else if (email[0] && typeof email[0] === 'object' && 'email' in email[0]) {
              emailValue = email[0].email;
            }
          }
        } else if (typeof email === 'string') {
          // If it's a simple string
          emailValue = email;
        } else if (email && typeof email === 'object') {
          // If it's a single email object
          emailValue = email.emailAddress || email.email || '';
        }
      }
      
      // If we still couldn't extract email, try to get it from sessionClaims
      if (!emailValue && sessionClaims && typeof sessionClaims.email === 'string') {
        emailValue = sessionClaims.email;
      }
      
      // If we still don't have an email, use the Clerk userId as the email (last resort)
      if (!emailValue) {
        emailValue = `${authUserId}@unknown.com`;
        console.log('No email found, using fallback:', emailValue);
      }
      
      console.log('Processed email value:', emailValue);
      
      // We already have finalOrgId from above, no need to redefine
      console.log('Inserting user with organization ID:', finalOrgId);
      
      await db.insert(users).values({
        userid: authUserId,
        email: emailValue,
        role: role,
        organisation_id: finalOrgId,
      });
    } catch (insertError) {
      console.error('Error during user insertion:', insertError instanceof Error ? insertError.message : String(insertError));
      throw insertError; // Re-throw to be caught by outer try/catch
    }

    // Return success response with role and organization information
    return NextResponse.json(
      { 
        message: 'User onboarded successfully', 
        role,
        organisationId: finalOrgId 
      },
      { status: 201 }
    );
  }  catch (error) {
    console.error('Error during onboarding:', error);
    
    // Provide more descriptive error messages to help with debugging
    let errorMessage = 'Failed to onboard user';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
