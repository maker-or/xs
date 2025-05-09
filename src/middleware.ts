import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Publicly accessible routes
const isPublicRoute = createRouteMatcher(["/", "/role-selection", "/loading", "/auth/redirect"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

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
