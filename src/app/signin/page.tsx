"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dark } from "@clerk/themes";

export default function SignInPage() {
  return (
    <div className="flex h-[100svh] w-[100svw] bg-[#050A06]">
      <Link
        href="/"
        className="absolute left-6 top-6 z-20 flex items-center text-sm text-[#d0cfcf] transition-colors duration-200 hover:text-[#f7eee3]"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={24} className="mr-1" />
        Back
      </Link>

      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050A06] p-6">
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
