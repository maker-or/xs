import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Publicly accessible routes
const publicRoutes = [
  '/',
  '/role-selection',
  '/onboarding',
  '/signin',
  '/signup',
  '/sign-in',
  '/sign-up',
  '/select',
  '/indauth',
  '/accept-invitation',
  '/privacy-policy',
  '/terms-of-service',
  '/pricing',
  '/waitlist',
  '/better',
  '/api/auth',
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Allow all API auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
  
  // Allow access to learning routes (handled by Better Auth)
  if (pathname.startsWith('/learning')) {
    return NextResponse.next();
  }
  
  // For now, allow all requests to pass through
  // The actual authentication check will be done by Better Auth in the components
  // and Convex functions will handle auth on the backend
  if (!isPublicRoute) {
    // Check for session cookie from Better Auth
    const sessionCookie = req.cookies.get('better-auth.session_token');
    
    if (!sessionCookie) {
      const signInUrl = new URL('/indauth', req.url);
      signInUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // If authenticated and trying to access root, redirect to select
  const sessionCookie = req.cookies.get('better-auth.session_token');
  if (sessionCookie && pathname === '/') {
    return NextResponse.redirect(new URL('/select', req.url));
  }
  
  // Handle legacy paths - redirect to new onboarding
  if (
    pathname === '/onbording' ||
    pathname === '/loading' ||
    pathname === '/auth/redirect'
  ) {
    return NextResponse.redirect(new URL('/onboarding', req.url), 301);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};