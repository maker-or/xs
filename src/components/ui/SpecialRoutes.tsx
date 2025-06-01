'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import First from './First';
import Para from './Para';

export default function SpecialRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should render their own content without the landing page layout
  const specialRoutes = [
    '/role-selection',
    '/signin',
    '/signup',
    '/sign-in',
    '/sign-up',
    '/onboarding'
  ];

  // If we're on any special route, show the page content directly
  if (specialRoutes.some(route => pathname.startsWith(route))) {
    return <>{children}</>;
  }

  // Otherwise, show the landing page layout
  return (
    <div className="min-h-[100svh] w-[100vw] bg-black text-[#a0a0a0] overflow-x-hidden">
      <Header />
      <div className="flex flex-col">
        <First />
        <Para />
      </div>
    </div>
  );
}