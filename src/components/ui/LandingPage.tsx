'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import React from 'react';
import Knowledge from './Knowledge';
import StackedLayers3D from './stackedLayers3D';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  return (
    <div className="w-full bg-[#0c0c0c] text-white">
      {/* Hero Section */}

      <div className="flex min-h-[100svh] w-full flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex items-center justify-center leading-none tracking-tight">
          <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl md:text-6xl lg:text-7xl">
            New <span className="font-serif italic">knowledge</span> layer{' '}
            <span className="hidden sm:inline"><br /></span>
            for your <span className="font-serif italic">collage</span>
          </h1>
        </div>

        <div className="mt-8 flex w-full max-w-xl flex-col gap-4 p-4 text-base sm:flex-row sm:justify-center">
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-xl bg-[#151715] px-8 py-4 font-medium shadow-[inset_2.71375px_2.71375px_12.6965px_rgba(227,194,194,0.25)] backdrop-blur-[27.3425px] transition-colors hover:bg-[#1f211f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E00]"
          >
            Join the waitlist
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-8 py-4 font-medium transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E00]"
          >
            Contact us
          </Link>
        </div>
      </div>
      <div className="relative flex min-h-[90vh] w-full items-center justify-center px-4">
        <StackedLayers3D />
      </div>
      <div className="relative flex min-h-[100svh] w-full items-center justify-center px-4">
        <Knowledge />
      </div>
    </div>
  );
};

export default LandingPage;
