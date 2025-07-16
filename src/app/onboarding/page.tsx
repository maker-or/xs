"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Checking your account...");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      // User not authenticated, redirect to sign-in
      router.replace("/sign-in");
      return;
    }

    const handleOnboarding = async () => {
      try {
        setStatus("Checking your account status...");
        setProgress(10);

        // Get organization ID from user metadata (set by Clerk during invitation signup)
        // or from URL parameters as fallback
        const orgIdFromUrl = searchParams.get("orgId");
        const orgIdFromMetadata = user.publicMetadata?.organizationId as string;
        const orgIdFromOrganizations =
          user.organizationMemberships?.[0]?.organization?.id;

        console.log("Organization ID sources:", {
          fromUrl: orgIdFromUrl,
          fromMetadata: orgIdFromMetadata,
          fromOrganizations: orgIdFromOrganizations,
          userOrganizations: user.organizationMemberships,
        });

        // Single API call to handle both status check and onboarding
        const response = await fetch("/api/onboarding/status-and-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.emailAddresses,
            // Priority: Organization membership > URL parameter > user metadata > null
            organisationId:
              orgIdFromOrganizations ||
              orgIdFromUrl ||
              orgIdFromMetadata ||
              null,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setProgress(60);

        if (data.isExistingUser) {
          setStatus("Welcome back! Redirecting to your dashboard...");
          setProgress(100);

          // Redirect based on role
          setTimeout(() => {
            if (data.role === "admin") {
              router.replace("/teacher");
            } else {
              router.replace("/student");
            }
          }, 1000);
        } else {
          setStatus("Setting up your account...");
          setProgress(80);

          // Simulate setup completion
          setTimeout(() => {
            setStatus("Account setup complete!");
            setProgress(100);

            // Redirect to appropriate dashboard
            setTimeout(() => {
              if (data.role === "admin") {
                router.replace("/teacher");
              } else {
                router.replace("/student");
              }
            }, 1500);
          }, 1000);
        }
      } catch (error) {
        console.error("Onboarding error:", error);
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Something went wrong"}`,
        );
        setIsProcessing(false);
      }
    };

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 200);

    handleOnboarding();

    return () => clearInterval(progressInterval);
  }, [user, isLoaded, router, searchParams]);

  const handleRetry = () => {
    setIsProcessing(true);
    setProgress(0);
    setStatus("Retrying account setup...");
    window.location.reload();
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#050A06] p-6 text-white">
      <h1 className="mb-4 font-serif text-3xl">Welcome aboard!</h1>
      <p className="mb-6 text-xl">{status}</p>

      {isProcessing ? (
        <>
          <div className="mb-4 h-2 w-64 rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={handleRetry}
            className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Retry
          </button>
          <a
            href="/sign-out"
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Sign out and try again
          </a>
        </div>
      )}
    </div>
  );
}
