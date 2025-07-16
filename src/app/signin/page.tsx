"use client";

import { SignIn } from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex h-screen w-full bg-[#050A06]">
      {/* Back button to landing page */}
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center text-sm text-[#d0cfcf] transition-colors duration-200 hover:text-[#f7eee3]"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={24} className="mr-1" />
        Back
      </Link>

      {/* Left side - Cloud Background */}
      <div className="relative hidden h-full overflow-hidden md:block md:w-1/2">
        {/* Background Image with clouds */}
        <div className="absolute inset-0 rounded-2xl bg-[#050A06]">
          <Image
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgPaiz9ylVUBCkXwNQOpI5g7lzEM8eoKYtH6i3"
            alt="Clouds Background"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        {/* Welcome Text */}
        <div className="relative z-10 flex h-full flex-col items-center justify-start p-16">
          <h1 className="text-center font-serif text-5xl italic tracking-wide text-[#f7eee3]">
            Welcome Back
          </h1>
          <p className="mt-4 text-center text-xl text-[#d0cfcf]">
            Continue your learning journey
          </p>
        </div>
      </div>

      {/* Right side - Sign In */}
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050A06] p-6 md:w-1/2">
        {/* Show cloud image on mobile */}
        <div className="relative mb-6 h-40 w-full overflow-hidden rounded-lg md:hidden">
          <Image
            src="https://sf2jdmaodp.ufs.sh/f/orc4evzyNtrgtZ08Ke5EmkbQ2MF9PAfO5i3logRYxzSHVZdu"
            alt="Logo"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:hidden">
            <h2 className="mb-2 font-serif text-3xl text-[#f7eee3]">
              Welcome Back
            </h2>
            <p className="text-[#d0cfcf]">Continue your learning journey</p>
          </div>

          {/* Clerk SignIn Component */}
          <div className="flex justify-center">
            <SignIn
              appearance={{
                baseTheme: dark,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
