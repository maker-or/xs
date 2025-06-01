'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full bg-[#050A06]">
      {/* Back button to landing page */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-sm text-[#d0cfcf] hover:text-[#f7eee3] transition-colors duration-200 z-20"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={24} className="mr-1" />
        Back
      </Link>
      
      {/* Left side - Cloud Background */}
      <div className="relative hidden md:block md:w-1/2 h-full overflow-hidden">
        {/* Background Image with clouds */}
        <div className="absolute inset-0 bg-[#050A06] rounded-2xl">
          <Image 
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgPaiz9ylVUBCkXwNQOpI5g7lzEM8eoKYtH6i3"
            alt="Clouds Background"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full p-16">
          <h1 className="text-5xl font-serif italic text-[#f7eee3] text-center tracking-wide">
            Welcome Back
          </h1>
          <p className="text-xl text-[#d0cfcf] mt-4 text-center">
            Continue your learning journey
          </p>
        </div>
      </div>
      
      {/* Right side - Sign In */}
      <div className="w-full md:w-1/2 h-full bg-[#050A06] flex flex-col items-center justify-center p-6">
        {/* Show cloud image on mobile */}
        <div className="md:hidden relative w-full h-40 mb-6 rounded-lg overflow-hidden">
          <Image 
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu"
            alt="Logo"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <h2 className="text-3xl font-serif text-[#f7eee3] mb-2">Welcome Back</h2>
            <p className="text-[#d0cfcf]">Continue your learning journey</p>
          </div>

          {/* Clerk SignIn Component */}
          <div className="flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-[#1a1a1a] border border-[#333] shadow-xl",
                  headerTitle: "text-[#f7eee3] text-2xl font-serif",
                  headerSubtitle: "text-[#d0cfcf]",
                  socialButtonsBlockButton: "bg-[#2a2a2a] border border-[#444] text-[#f7eee3] hover:bg-[#3a3a3a]",
                  formFieldInput: "bg-[#2a2a2a] border border-[#444] text-[#f7eee3] focus:border-[#FF5E00]",
                  formButtonPrimary: "bg-[#FF5E00] hover:bg-[#e54d00] text-white",
                  footerActionLink: "text-[#FF5E00] hover:text-[#e54d00]",
                  identityPreviewText: "text-[#d0cfcf]",
                  formFieldLabel: "text-[#d0cfcf]",
                }
              }}
              forceRedirectUrl="/onboarding"
              signUpUrl="/signup"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
