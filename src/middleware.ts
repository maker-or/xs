import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Publicly accessible routes
const isPublicRoute = createRouteMatcher([
  '/',
  '/role-selection',
  '/onboarding',
  '/signin',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/select',
  '/indauth',
  '/accept-invitation/',
  '/privacy-policy',
  '/terms-of-service',
  '/pricing',
  '/waitlist',
    '/better',
  '/api/auth/validate_domain',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // // Check for invitation link parameters (Clerk adds a __clerk_ticket param)
  // const isInvitationLink = req.nextUrl.searchParams.has("__clerk_ticket");
  // const isAcceptInvitationRoute = req.nextUrl.pathname === "/accept-invitation";

  // // Special handling for invitation links - let Clerk handle these without interference
  // if (isInvitationLink || isAcceptInvitationRoute) {
  //   return NextResponse.next();
  // }

  // Unauthenticated user trying to access a protected route → redirect to sign-in
  if (!(userId || isPublicRoute(req))) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Authenticated user accessing the root - redirect to select for new flow
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/select', req.url));
  }

  // Handle legacy paths - redirect to new onboarding
  if (
    req.nextUrl.pathname === '/onbording' ||
    req.nextUrl.pathname === '/loading' ||
    req.nextUrl.pathname === '/auth/redirect'
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url), 301);
  }

  // Allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
