// SignUpPage.tsx

'use client';

import { SignUp, useSignUp, useUser } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ArrowLeft } from 'lucide-react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isValidInvitation, setIsValidInvitation] = useState<boolean | null>(
    null
  );

  // Get the invitation token from the URL
  const invitationToken = searchParams.get('__clerk_ticket');
  const orgId = searchParams.get('organization');
  setOrganizationId(orgId);

  useEffect(() => {
    if (signUpLoaded) {
      if (invitationToken) {
        setIsValidInvitation(true);
      } else {
        setIsValidInvitation(false);
      }
    }

    // If user is already signed in, redirect to onboarding
    if (isLoaded && isSignedIn) {
      router.replace('/onboarding');
    }
  }, [isSignedIn, isLoaded, router, signUpLoaded, invitationToken]);

  // Show loading while checking invitation validity
  if (isValidInvitation === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-solid" />
          <p>Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Show error for invalid invitation
  if (!isValidInvitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="mb-4 font-serif text-2xl">Invalid Invitation</h1>
          <p className="mb-6 text-[#d0cfcf]">
            This signup link is invalid or missing required information. Please
            contact your administrator for a valid invitation link.
          </p>
          <Link
            className="inline-block rounded-md bg-[#FF5E00] px-6 py-2 text-white transition-colors hover:bg-[#e54d00]"
            href="/"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Don't render the sign-up form if user is already signed in
  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-solid" />
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#050A06]">
      {/* Back button to landing page */}
      <Link
        aria-label="Back to landing page"
        className="absolute top-6 left-6 z-20 flex items-center text-[#d0cfcf] text-sm transition-colors duration-200 hover:text-[#f7eee3]"
        href="/"
      >
        <ArrowLeft className="mr-1" size={24} />
        Back
      </Link>

      {/* Left side - Cloud Background */}
      <div className="relative hidden h-full overflow-hidden md:block md:w-1/2">
        {/* Welcome Text */}
        <div className="relative z-10 flex h-full flex-col items-center justify-start p-16">
          <h1 className="text-center font-serif text-5xl text-[#f7eee3] italic tracking-wide">
            Join Your Team
          </h1>
          <p className="mt-4 text-center text-[#d0cfcf] text-xl">
            You&apos;ve been invited to join an organization
          </p>
          {organizationId && (
            <div className="mt-6 rounded-lg border border-[#333] bg-[#1a1a1a] p-4">
              <p className="text-[#d0cfcf] text-sm">
                Valid invitation detected
              </p>
              <p className="text-[#FF5E00] text-sm">
                ✓ Ready to join organization
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Sign Up */}
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050A06] p-6 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <h2 className="mb-2 font-serif text-3xl text-[#f7eee3]">
              Join Your Team
            </h2>
            <p className="text-[#d0cfcf]">You&apos;ve been invited to join</p>
            {organizationId && (
              <div className="mt-4 rounded-lg border border-[#333] bg-[#1a1a1a] p-3">
                <p className="text-[#d0cfcf] text-xs">
                  Valid invitation detected
                </p>
                <p className="text-[#FF5E00] text-sm">✓ Ready to join</p>
              </div>
            )}
          </div>

          {/* Clerk SignUp Component */}
          <div className="flex justify-center">
            <SignUp
              appearance={{
                baseTheme: dark,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
