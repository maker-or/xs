'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import Header from './Header';
import LandingPage from './LandingPage';

export default function SpecialRoutes({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes that should render their own content without the landing page layout
  const specialRoutes = [
    '/role-selection',
    '/signin',
    '/signup',
    '/sign-in',
    '/sign-up',
    '/select',
    '/indauth',
    '/onboarding',
    '/waitlist',
  ];

  // If we're on any special route, show the page content directly
  if (specialRoutes.some((route) => pathname.startsWith(route))) {
    return <>{children}</>;
  }

  // Otherwise, show the landing page layout
  return (
    <div className="min-h-[100svh] w-[100vw] bg-black text-[#a0a0a0]">
      <Header />
      <LandingPage />
    </div>
  );
}
