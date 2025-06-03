'use client';

import { SignUp, useSignUp } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isValidInvitation, setIsValidInvitation] = useState<boolean | null>(null);

  // Get the invitation token from the URL
  const invitationToken = searchParams.get('__clerk_ticket');

  useEffect(() => {
    // Check if we have an invitation token
    if (signUpLoaded && invitationToken) {
      // Verify the invitation token format
      if (invitationToken.startsWith('dvb_')) {
        console.log('Valid Clerk invitation token found:', invitationToken);
        setOrganizationId('invitation-based'); // Placeholder - will be resolved after signup
        setIsValidInvitation(true);
      } else {
        console.warn('Invalid invitation token format');
        setIsValidInvitation(false);
      }
    } else if (signUpLoaded && !invitationToken) {
      // No invitation token - invalid invitation
      setIsValidInvitation(false);
    }

    // If user is already signed in, redirect to onboarding
    if (isLoaded && isSignedIn) {
      router.replace('/onboarding');
    }
  }, [isSignedIn, isLoaded, router, signUpLoaded, invitationToken]);

  // Show loading while checking invitation validity
  if (isValidInvitation === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050A06] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <p>Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Show error for invalid invitation
  if (!isValidInvitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050A06] text-white">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-serif mb-4">Invalid Invitation</h1>
          <p className="text-[#d0cfcf] mb-6">
            This signup link is invalid or missing required information.
            Please contact your administrator for a valid invitation link.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-2 bg-[#FF5E00] text-white rounded-md hover:bg-[#e54d00] transition-colors"
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
      <div className="flex items-center justify-center min-h-screen bg-[#050A06] text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#050A06]">
      {/* Back button to landing page */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-sm text-[#d0cfcf] hover:text-[#f7eee3] transition-colors duration-200 z-20"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={24} className="mr-1" />
        Back
      </Link>
      
      {/* Left side - Cloud Background */}
      <div className="relative hidden md:block md:w-1/2 h-full overflow-hidden">
        {/* Background Image with clouds */}
        <div className="absolute inset-0 bg-[#050A06] rounded-2xl">
          <Image 
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgPaiz9ylVUBCkXwNQOpI5g7lzEM8eoKYtH6i3"
            alt="Clouds Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full p-16">
          <h1 className="text-5xl font-serif italic text-[#f7eee3] text-center tracking-wide">
            Join Your Team
          </h1>
          <p className="text-xl text-[#d0cfcf] mt-4 text-center">
            You&apos;ve been invited to join an organization
          </p>
          {organizationId && (
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
              <p className="text-sm text-[#d0cfcf]">Valid invitation detected</p>
              <p className="text-[#FF5E00] text-sm">✓ Ready to join organization</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Sign Up */}
      <div className="w-full md:w-1/2 h-full bg-[#050A06] flex flex-col items-center justify-center p-6">
        {/* Show cloud image on mobile */}
        <div className="md:hidden relative w-full h-40 mb-6 rounded-lg overflow-hidden">
          <Image 
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu"
            alt="Logo"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <h2 className="text-3xl font-serif text-[#f7eee3] mb-2">Join Your Team</h2>
            <p className="text-[#d0cfcf]">You&apos;ve been invited to join</p>
            {organizationId && (
              <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                <p className="text-xs text-[#d0cfcf]">Valid invitation detected</p>
                <p className="text-[#FF5E00] text-sm">✓ Ready to join</p>
              </div>
            )}
          </div>

          {/* Clerk SignUp Component */}
          <div className="flex justify-center">
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#1a1a1a] border border-[#333] shadow-xl",
                  headerTitle: "text-[#f7eee3] text-2xl font-serif",
                  headerSubtitle: "text-[#d0cfcf]",
                  socialButtonsBlockButton: "bg-[#2a2a2a] border border-[#444] text-[#f7eee3] hover:bg-[#3a3a3a]",
                  formFieldInput: "bg-[#2a2a2a] border border-[#444] text-[#f7eee3] focus:border-[#FF5E00]",
                  formButtonPrimary: "bg-[#FF5E00] hover:bg-[#e54d00] text-white",
                  footerActionLink: "text-[#FF5E00] hover:text-[#e54d00]",
                  identityPreviewText: "text-[#d0cfcf]",
                  formFieldLabel: "text-[#d0cfcf]",
                }
              }}
              forceRedirectUrl="/onboarding"
              signInUrl="/signin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
