'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDefaultRedirectUrl, getUserType } from '~/lib/auth-utils';

export default function OnboardingPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Checking your account...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  // Get authentication type from URL params
  const authType = searchParams.get('type'); // "google" or "college"

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      // User not authenticated, redirect to sign-in
      console.error('this si from onbording page asn yopu know me');
      router.replace('/signin');
      return;
    }

    const handleOnboarding = async () => {
      try {
        setStatus('Determining your account type...');
        setProgress(10);

        // Determine user type based on authentication method
        const userType = getUserType(user, authType || undefined);

        console.log('User type determined:', userType, 'Auth type:', authType);

        // Handle Google users (limited access)
        if (userType === 'google_user') {
          setStatus('Setting up your Google account...');
          setProgress(50);

          // Google users get direct access to learning platform
          setStatus('Welcome! Redirecting to learning platform...');
          setProgress(100);

          setTimeout(() => {
            router.replace('/learning');
          }, 1000);
          return;
        }

        // Handle college users and admins (full access)
        setStatus('Checking your account status...');
        setProgress(30);

        // Enhanced organization ID resolution for college users
        const orgIdFromUrl =
          searchParams.get('orgId') || searchParams.get('organization_id');
        const orgIdFromMetadata = user.publicMetadata?.organizationId as string;

        // Get organization ID from user's current organization memberships
        const currentOrgMembership = user.organizationMemberships?.find(
          (membership) => membership.organization?.id
        );
        const orgIdFromMemberships = currentOrgMembership?.organization?.id;

        // Get role from organization membership
        const orgRole = currentOrgMembership?.role;

        console.log('Organization ID resolution:', {
          fromUrl: orgIdFromUrl,
          fromMetadata: orgIdFromMetadata,
          fromMemberships: orgIdFromMemberships,
          orgRole,
          userType,
        });

        // For college users, we need an organization
        const finalOrgId =
          orgIdFromUrl || orgIdFromMemberships || orgIdFromMetadata;

        // College users without organization get a default experience
        if (!finalOrgId && userType === 'college_user') {
          console.warn('No organization ID found for college user');
          setStatus('Setting up your college account...');
          setProgress(70);

          // Redirect college users to student dashboard by default
          setStatus('Welcome! Redirecting to your dashboard...');
          setProgress(100);

          setTimeout(() => {
            router.replace('/student');
          }, 1000);
          return;
        }

        // Handle organization-based college users and admins
        if (finalOrgId) {
          setStatus('Setting up your account...');
          setProgress(50);

          // Single API call to handle both status check and onboarding
          const response = await fetch('/api/onboarding/status-and-setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.emailAddresses,
              organisationId: finalOrgId,
              // Pass the role from organization membership if available
              role: orgRole || 'member', // Default to 'member' if no role specified
              userType, // Include user type for better handling
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setProgress(80);

          console.log('Onboarding response:', data);

          if (data.isExistingUser) {
            setStatus('Welcome back! Redirecting to your dashboard...');
            setProgress(100);

            // Redirect based on user type and role
            setTimeout(() => {
              const redirectUrl = getDefaultRedirectUrl(
                userType === 'admin' || data.role === 'admin'
                  ? 'admin'
                  : userType
              );
              router.replace(redirectUrl);
            }, 1000);
          } else {
            setStatus('Account created successfully! Redirecting...');
            setProgress(100);

            // Redirect based on user type and role for new users
            setTimeout(() => {
              const redirectUrl = getDefaultRedirectUrl(
                userType === 'admin' || data.role === 'admin'
                  ? 'admin'
                  : userType
              );
              router.replace(redirectUrl);
            }, 1000);
          }
        } else {
          // Fallback for users without organization
          setStatus('Setting up your account...');
          setProgress(70);

          setStatus('Welcome! Redirecting to your dashboard...');
          setProgress(100);

          setTimeout(() => {
            const redirectUrl = getDefaultRedirectUrl(userType);
            router.replace(redirectUrl);
          }, 1000);
        }
      } catch (error) {
        console.error('Onboarding error:', error);
        setStatus('Error during onboarding. Please try again.');
        setProgress(0);
        setIsProcessing(false);
      }
    };

    handleOnboarding();
  }, [isLoaded, user, router, searchParams, authType]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-solid" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-2xl text-[#f7eee3]">
            Welcome to sphereai
          </h1>
          <p className="text-[#d0cfcf]">Setting your account</p>
        </div>

        <div className="mb-6">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#333]">
            <div
              className="h-full bg-gradient-to-r from-[#FF5E00] to-[#e54d00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[#d0cfcf] text-sm">{status}</p>
        </div>

        {!isProcessing && progress === 0 && (
          <div className="mt-6">
            <button
              className="rounded-md bg-[#FF5E00] px-6 py-2 text-white transition-colors hover:bg-[#e54d00]"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Show organization info if available */}
        {user?.organizationMemberships &&
          user.organizationMemberships.length > 0 && (
            <div className="mt-6 rounded-lg border border-[#333] bg-[#1a1a1a] p-4">
              <p className="text-[#d0cfcf] text-sm">
                Organization:{' '}
                {user.organizationMemberships?.[0]?.organization?.name ??
                  user.organizationMemberships?.[0]?.organization?.id ??
                  'Unknown'}
              </p>
              <p className="text-[#FF5E00] text-xs">
                Role: {user.organizationMemberships?.[0]?.role ?? 'Unknown'}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
