"use client";

import React, { useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { dark } from "@clerk/themes";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<
    "student" | "teacher" | null
  >(null);
  const router = useRouter();

  // Redirect to auth redirect page after sign-in (which will handle routing based on onboarding status)
  useEffect(() => {
    if (selectedRole) {
      // This will run after Clerk sign-in is complete
      const handleClerkSignInComplete = () => {
        router.push("/auth/redirect");
      };

      // Listen for Clerk sign-in complete event
      if (typeof window !== "undefined") {
        window.addEventListener(
          "ClerkSignInComplete",
          handleClerkSignInComplete,
        );
      }

      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener(
            "ClerkSignInComplete",
            handleClerkSignInComplete,
          );
        }
      };
    }
  }, [selectedRole, router]);

  // Just for backward compatibility - roles are now determined by Clerk org_role
  const handleRoleSelect = () => {
    setSelectedRole("student"); // Doesn't matter which role, just to show sign-in
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

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

      {/* Right side - Sign In */}
      <div className="flex h-full w-full flex-col items-center justify-center bg-[#050A06] p-6 md:w-1/2">
        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="role-selection"
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md space-y-8"
            >
              <div className="mb-8">
                <h1 className="mb-2 text-left font-serif text-4xl text-[#c5c3c3]">
                  Welcome
                </h1>
                <p className="mb-6 text-[#f7eee3]">
                  Sign in to continue. Your role will be automatically
                  determined based on your organization settings.
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => handleRoleSelect()}
                  className="group relative flex w-full items-center justify-between rounded-lg border-2 border-[#ffffff] bg-[#050A06] p-4 text-[#f7eee3] transition-all duration-300 ease-in-out hover:border-[#f7eee3] hover:bg-[#12689382]"
                >
                  <span className="font-serif text-2xl group-hover:text-[#f7eee3]">
                    Sign In
                  </span>
                  <div className="rounded-full p-2">
                    <ArrowRight size={24} />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="sign-in"
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-xl p-8"
            >
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="flex items-center text-sm text-[#d0cfcf] transition-colors duration-200 hover:text-[#f7eee3]"
                  aria-label="Change role"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 19L8 12L15 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                      colorPrimary: "#FF5E00",
                      colorBackground: "#050A06",
                      colorInputBackground: "#050A06",
                      colorInputText: "#f7eee3",
                      colorText: "#f7eee3",
                      borderRadius: "0.45rem",
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
