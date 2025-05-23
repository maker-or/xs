import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Publicly accessible routes
const isPublicRoute = createRouteMatcher(["/", "/role-selection", "/loading", "/auth/redirect"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();
  
  // Check for invitation link parameters (Clerk adds a __clerk_ticket param)
  const isInvitationLink = req.nextUrl.searchParams.has('__clerk_ticket');
  
  // Special handling for invitation links - let Clerk handle these without interference
  if (isInvitationLink) {
    console.log('Detected invitation link access - allowing Clerk to handle it');
    return NextResponse.next();
  }

  // Unauthenticated user trying to access a protected route → redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }
  
  // Authenticated user accessing the root - check onboarding status
  if (userId && req.nextUrl.pathname === '/') {
    // For authenticated users, we'll redirect based on onboarding status
    // This is handled in the page component instead of middleware
    // because middleware can't easily make API calls to our database
    return NextResponse.redirect(new URL('/auth/redirect', req.url));
  }
  
  // Handle any requests to the old onbording path - permanently redirect to loading
  if (req.nextUrl.pathname === '/onbording') {
    return NextResponse.redirect(new URL('/loading', req.url), 301);
  }
  
  // If a user tries to access the loading page directly, redirect them to auth/redirect
  // so proper onboarding status checks can be performed
  if (userId && req.nextUrl.pathname === '/loading') {
    // Only redirect if they're coming from somewhere other than auth/redirect
    const referer = req.headers.get('referer') || '';
    if (!referer.includes('/auth/redirect')) {
      return NextResponse.redirect(new URL('/auth/redirect', req.url));
    }
  }
  
  // Log helpful information about the session for debugging invitation flows
  if (userId && (req.nextUrl.pathname === '/loading' || req.nextUrl.pathname === '/auth/redirect')) {
    console.log('Auth debug info:', {
      path: req.nextUrl.pathname,
      userId,
      hasSessionClaims: !!sessionClaims,
      org_id: sessionClaims?.org_id,
      org_role: sessionClaims?.org_role
    });
  }

  // Allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static and internal files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API routes
    '/(api|trpc)(.*)',
  ],
};
