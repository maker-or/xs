import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for validating the request
const validateDomainSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// List of allowed college domains - this can be expanded or moved to a database
const allowedDomains = [
  'vvit.net',
  'iitb.ac.in',
  'iitd.ac.in',
  'iitm.ac.in',
  'iitk.ac.in',
  'iisc.ac.in',
  'bits-pilani.ac.in',
  'nit.ac.in',
  'iiit.ac.in',
  // Add more college domains as needed
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const { email } = validateDomainSchema.parse(body);

    // Extract domain from email
    const domain = email.split('@')[1]?.toLowerCase();

    if (!domain) {
      return NextResponse.json(
        { error: 'Invalid email format', isValid: false },
        { status: 400 }
      );
    }

    // Check if domain is in allowed list
    const isValid = allowedDomains.includes(domain);

    if (isValid) {
      return NextResponse.json({
        isValid: true,
        domain,
        message: 'College domain validated successfully',
        nextStep: 'clerk_auth',
      });
    }
    return NextResponse.json({
      isValid: false,
      domain,
      message: "Your college doesn't have access to sphereai",
      availableDomains: allowedDomains.slice(0, 5), // Show first 5 as examples
    });
  } catch (error) {
    console.error('Domain validation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
          isValid: false,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', isValid: false },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve list of allowed domains (for debugging/admin purposes)
export async function GET() {
  return NextResponse.json({
    allowedDomains,
    count: allowedDomains.length,
  });
}
