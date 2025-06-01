import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Publicly accessible routes
const isPublicRoute = createRouteMatcher(["/", "/role-selection", "/onboarding", "/signin", "/signup", "/sign-in", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // Check for invitation link parameters (Clerk adds a __clerk_ticket param)
  const isInvitationLink = req.nextUrl.searchParams.has('__clerk_ticket');

  // Special handling for invitation links - let Clerk handle these without interference
  if (isInvitationLink) {
    return NextResponse.next();
  }

  // Unauthenticated user trying to access a protected route → redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Authenticated user accessing the root - redirect to onboarding
  if (userId && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // Handle legacy paths - redirect to new onboarding
  if (req.nextUrl.pathname === '/onbording' || req.nextUrl.pathname === '/loading' || req.nextUrl.pathname === '/auth/redirect') {
    return NextResponse.redirect(new URL('/onboarding', req.url), 301);
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
