'use client';

import React, { useState, useEffect } from 'react';
import { SignIn } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { dark } from '@clerk/themes';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const router = useRouter();

  // Redirect to auth redirect page after sign-in (which will handle routing based on onboarding status)
  useEffect(() => {
    if (selectedRole) {
      // This will run after Clerk sign-in is complete
      const handleClerkSignInComplete = () => {
        router.push('/auth/redirect');
      };
      
      // Listen for Clerk sign-in complete event
      if (typeof window !== 'undefined') {
        window.addEventListener('ClerkSignInComplete', handleClerkSignInComplete);
      }
      
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('ClerkSignInComplete', handleClerkSignInComplete);
        }
      };
    }
  }, [selectedRole, router]);

  // Just for backward compatibility - roles are now determined by Clerk org_role
  const handleRoleSelect = () => {
    setSelectedRole('student'); // Doesn't matter which role, just to show sign-in
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } }
  };

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
        
        {/* Happy Learning Text */}
        <div className="relative z-10 flex flex-col items-center justify-start h-full p-16">
          <h1 className="text-5xl font-serif italic text-[#f7eee3] text-center tracking-wide">
            Happy Learning
          </h1>
        </div>
      </div>
      
      {/* Right side - Sign In */}
      <div className="w-full md:w-1/2 h-full bg-[#050A06] flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="role-selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md space-y-8"
            >
              <div className="mb-8">
                {/* Show cloud image on mobile */}
                <div className="md:hidden relative w-full h-40 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu"
                    alt="Clouds Background"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-4xl font-serif italic text-[#f7eee3] font-bold tracking-wide">
                      Happy Learning
                    </h1>
                  </div>
                </div>
                <h1 className="text-left text-4xl font-serif text-[#c5c3c3] mb-2">Welcome</h1>
                <p className="text-[#f7eee3] mb-6">Sign in to continue. Your role will be automatically determined based on your organization settings.</p>
              </div>
            
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleRoleSelect()}
                  className="group relative flex items-center justify-between w-full rounded-lg border-2 border-[#ffffff] bg-[#050A06] p-4 text-[#f7eee3] transition-all duration-300 ease-in-out hover:border-[#f7eee3] hover:bg-[#12689382]"
                >
                  <span className="text-2xl font-serif group-hover:text-[#f7eee3]">Sign In</span>
                  <div className="rounded-full p-2">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sign-in"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-xl p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center text-sm text-[#d0cfcf] hover:text-[#f7eee3] transition-colors duration-200"
                  aria-label="Change role"
                >
                  <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back
                </button>
              </div>
              
              <div className="clerk-sign-in-container"> 
                <SignIn 
                  routing="hash"
                  redirectUrl="/auth/redirect"
                  afterSignInUrl="/auth/redirect"
                  appearance={{
                    baseTheme: dark, 
                    variables: {
                      colorPrimary: '#FF5E00', 
                      colorBackground: '#050A06',
                      colorInputBackground: '#050A06',
                      colorInputText: '#f7eee3',
                      colorText: '#f7eee3',
                      borderRadius: '0.45rem',
                    },
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
