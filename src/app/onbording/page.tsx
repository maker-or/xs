'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a simple redirect component for backward compatibility
export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#050A06] text-white">
      <p>Redirecting to onboarding...</p>
    </div>
  );
}
