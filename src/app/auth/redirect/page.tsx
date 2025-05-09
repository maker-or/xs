'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isLoaded || !isSignedIn) return;
      
      try {
        // Check if the user has already been onboarded
        const response = await fetch('/api/auth/onboarding-status');
        const data = await response.json();
        
        if (data.isOnboarded) {
          // User already exists in our database, redirect to appropriate page
          if (data.role === 'admin') {
            router.replace('/teacher');
          } else {
            router.replace('/student');
          }
        } else {
          // First-time user needs to go through onboarding
          router.replace('/loading');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If there's an error, just redirect to the loading page as a fallback
        router.replace('/loading');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkOnboardingStatus();
  }, [isLoaded, isSignedIn, router, user]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050A06] text-white">
      {isChecking && (
        <div className="text-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mb-4 mx-auto"></div>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  );
}
