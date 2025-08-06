'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [status, setStatus] = useState('Checking your account status...');

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!(isLoaded && isSignedIn)) return;

      try {
        // This is the single source of truth for determining if a user needs onboarding
        setStatus('Checking if you need to be onboarded...');
        const response = await fetch('/api/auth/onboarding-status');
        const data = await response.json();

        if (data.isOnboarded) {
          // User already exists in our database, redirect to appropriate page
          setStatus('Welcome back! Redirecting to your dashboard...');
          if (data.role === 'admin') {
            router.replace('/teacher');
          } else {
            router.replace('/student');
          }
        } else {
          // First-time user needs to go through onboarding
          setStatus('Setting up your account...');
          // Pass any organization ID we received back from the API to ensure it's consistently used
          router.replace(
            `/loading${data.organisationId ? `?orgId=${encodeURIComponent(data.organisationId)}` : ''}`
          );
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, just redirect to the loading page as a fallback
        setStatus('Preparing onboarding process...');
        router.replace('/loading');
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [isLoaded, isSignedIn, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
      {isChecking && (
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-solid" />
          <p className="mb-2 text-xl">{status}</p>
          <p className="text-gray-400 text-sm">
            Please wait, this won&apos;t take long...
          </p>
        </div>
      )}
    </div>
  );
}
