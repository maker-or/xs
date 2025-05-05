'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import First from './First';
import Para from './Para';

export default function SpecialRoutes({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we're on the role-selection page, show it
  if (pathname === '/role-selection') {
    return <>{children}</>;
  }
  
  // Otherwise, show the home page
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