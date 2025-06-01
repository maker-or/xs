'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a simple redirect component for backward compatibility
export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#050A06] text-white">
      <p>Redirecting to onboarding...</p>
    </div>
  );
}
