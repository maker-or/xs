'use client';

import { useAuth, useSignIn } from '@clerk/nextjs';
// src/pages/Indauth.tsx
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';

const zschema = z.object({
  userPrompt: z
    .string()
    .trim()
    .email()
    .min(2, { message: 'Input cannot be empty or just spaces' }),
});

type FormValues = z.infer<typeof zschema>;

const Indauth = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn } = useSignIn();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const form = useForm({
    defaultValues: {
      userPrompt: '',
    } as FormValues,
    onSubmit: async ({ value }) => {
      const email = value.userPrompt;
      setIsValidating(true);
      setErrorMessage(null);

      try {
        // Validate domain with our API
        console.log('Making request to validate domain for email:', email);
        const response = await fetch('/api/auth/validate_domain', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);

        if (data.isValid) {
          // Domain is valid, proceed with Clerk authentication
          await handleClerkAuth(email);
        } else {
          setErrorMessage(
            data.message || "Your college doesn't have access to sphereai"
          );
        }
      } catch (error) {
        console.error('Domain validation error:', error);
        setErrorMessage('Failed to validate college domain. Please try again.');
      } finally {
        setIsValidating(false);
      }
    },
    validators: {
      onSubmit: zschema,
    },
  });

  const handleClerkAuth = async (email: string) => {
    if (!signIn) return;

    setIsAuthenticating(true);

    // If user is already signed in, redirect them
    if (isSignedIn) {
      router.replace('/onboarding?type=college');
      return null;
    }

    try {
      router.push('/signin');
    } catch (emailError) {
      console.error('Email sign-in error:', emailError);
      setErrorMessage(
        'Failed to authenticate. Please try again or contact support.'
      );
      setIsAuthenticating(false);
    }
  };

  return (
    <main className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#0c0c0c]">
      {/* Noise background */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />

      {/* Decorative grid lines and circles */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Vertical lines */}
        <div className="absolute top-0 left-[20%] h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        <div className="absolute top-0 left-[80%] h-full w-px bg-gradient-to-b from-white/30 via-white/10 to-white/30" />
        {/* Horizontal lines */}
        <div className="absolute top-[15%] left-[20%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        <div className="absolute top-[85%] left-[20%] h-px w-[60%] bg-gradient-to-r from-white/30 via-white/10 to-white/30" />
        {/* Corner circles */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[15%] left-[20%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[15%] left-[80%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[85%] left-[20%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[85%] left-[80%] h-3 w-3 rounded-full bg-white/60 shadow-lg" />
      </div>

      {/* Main content */}
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="font-light text-[2em]">
          Enter your <span className="font-serif italic">
            college mail
          </span>{' '}
        </h1>
        <form.Field name="userPrompt">
          {({ state, handleBlur, handleChange }) => (
            <>
              <textarea
                className="min-h-[40px] w-1/4 resize-none rounded-lg border-none bg-[#313131] px-2 py-2 text-[#f7eee3] text-lg placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-0 disabled:opacity-50"
                disabled={isValidating || isAuthenticating}
                onBlur={handleBlur}
                onChange={(e) => handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void form.handleSubmit();
                  }
                }}
                placeholder="collage@mail.com"
                value={state.value}
              />
              {(isValidating || isAuthenticating) && (
                <div className="mt-2 flex items-center justify-center">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span className="ml-2 text-sm text-white">
                    {isValidating
                      ? 'Validating domain...'
                      : 'Authenticating...'}
                  </span>
                </div>
              )}
              {errorMessage && (
                <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              )}
            </>
          )}
        </form.Field>
      </div>
    </main>
  );
};

export default Indauth;
