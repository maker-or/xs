'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoadingPage() {
  const { user, isLoaded } = useUser();
  const { orgId, orgRole } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('Setting up your account...');
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      console.log('User not loaded yet, waiting...');
      return;
    }
    
    // This page should only handle users who need to be onboarded
    // The redirect page handles checking if users are already onboarded
    
    console.log('Starting onboarding process with user:', {
      userId: user?.id,
      emailAddresses: user?.emailAddresses,
      organizationId: orgId
    });

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 500);

    const doOnboarding = async () => {
      try {
        // Since we're receiving users directly from auth/redirect,
        // we assume this user needs onboarding
        setStatus('Setting up your account...');
        
        // First check role from session claims
        const roleCheck = await fetch('/api/auth/role', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!roleCheck.ok) {
          throw new Error('Failed to retrieve role information');
        }
        
        const roleData = await roleCheck.json();
        console.log('Role information:', roleData);
        
        // Now proceed with onboarding using role from session claims
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.emailAddresses || [], // Add null check with fallback
            organisationId: orgId || '',
            // No need to pass role - it will be determined from sessionClaims in the API
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setProgress(100);
          setStatus('Account setup complete!');
          
          // Redirect based on role from the API response
          // Use router.replace to prevent users from going back to the loading page
          setTimeout(() => {
            if (data.role === 'admin') {
              router.replace('/teacher');
            } else {
              router.replace('/student');
            }
          }, 1500);
        } else {
          // Improved error handling
          try {
            const errorData = await res.json();
            const errorMessage = errorData.error || `Server error (${res.status})`;
            setStatus(`Onboarding failed: ${errorMessage}`);
            console.error('Onboarding failed:', errorData, 'Status:', res.status);
          } catch (jsonError) {
            setStatus(`Onboarding failed: Unable to parse error response (${res.status})`);
            console.error('Onboarding failed with status:', res.status, 'Error parsing response:', jsonError);
          }
          setIsProcessing(false);
        }
      }      catch (error) {
        console.error('Onboarding error:', error);
        // Show detailed error for debugging
        if (error instanceof Error) {
          setStatus(`Error: ${error.message}`);
          console.error('Error stack:', error.stack);
        } else {
          setStatus('An unexpected error occurred. Please try again.');
          console.error('Unhandled error type:', typeof error);
        }
        setIsProcessing(false);
        
        // Add retry button to UI when processing fails
      } finally {
        clearInterval(interval);
      }
    };

    doOnboarding();

    return () => clearInterval(interval);
  }, [user, isLoaded, orgId, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-white bg-[#050A06] p-6">
      <div className="relative w-24 h-24 mb-8">
        <Image 
          src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu"
          alt="Logo"
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-full"
        />
      </div>
      
      <h1 className="text-3xl font-serif mb-4">Welcome aboard!</h1>
      <p className="text-xl mb-6">{status}</p>
      
      {isProcessing ? (
        <>
          <div className="w-64 h-2 bg-gray-700 rounded-full mb-4">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{Math.round(progress)}%</p>
        </>
      ) : (
        // Show retry button if there was an error
        <>
          <button 
            onClick={() => {
              setIsProcessing(true);
              setProgress(0);
              setStatus('Retrying account setup...');
              // Force reload the page to restart the onboarding process
              window.location.reload();
            }}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <a 
            href="/auth/redirect" 
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Return to dashboard
          </a>
        </>
      )}
    </div>
  );
}
