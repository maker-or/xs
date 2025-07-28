"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

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

        // Enhanced organization ID resolution with better priority order
        const orgIdFromUrl =
          searchParams.get("orgId") || searchParams.get("organization_id");
        const orgIdFromMetadata = user.publicMetadata?.organizationId as string;

        // Get organization ID from user's current organization memberships
        const currentOrgMembership = user.organizationMemberships?.find(
          (membership) => membership.organization?.id,
        );
        const orgIdFromMemberships = currentOrgMembership?.organization?.id;

        // Get role from organization membership
        const orgRole = currentOrgMembership?.role;

        console.log("Organization ID resolution:", {
          fromUrl: orgIdFromUrl,
          fromMetadata: orgIdFromMetadata,
          fromMemberships: orgIdFromMemberships,
          orgRole: orgRole,
          allMemberships: user.organizationMemberships,
        });

        // Priority order for organization ID:
        // 1. From URL (most recent, from invitation flow)
        // 2. From organization memberships (current active membership)
        // 3. From user metadata (fallback)
        const finalOrgId =
          orgIdFromUrl || orgIdFromMemberships || orgIdFromMetadata;

        if (!finalOrgId) {
          console.warn("No organization ID found in any source");
          setStatus(
            "No organization found. Please contact your administrator.",
          );
          setIsProcessing(false);
          return;
        }

        setStatus("Setting up your account...");
        setProgress(30);

        // Single API call to handle both status check and onboarding
        const response = await fetch("/api/onboarding/status-and-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.emailAddresses,
            organisationId: finalOrgId,
            // Pass the role from organization membership if available
            role: orgRole || "member", // Default to 'member' if no role specified
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProgress(60);

        console.log("Onboarding response:", data);

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
          setStatus("Account created successfully! Redirecting...");
          setProgress(100);

          // Redirect based on role for new users
          setTimeout(() => {
            if (data.role === "admin") {
              router.replace("/teacher");
            } else {
              router.replace("/student");
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Onboarding error:", error);
        setStatus("Error during onboarding. Please try again.");
        setProgress(0);
        setIsProcessing(false);
      }
    };

    handleOnboarding();
  }, [isLoaded, user, router, searchParams]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-solid border-blue-500"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050A06] text-white">
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <h1 className="mb-2 font-serif text-2xl text-[#f7eee3]">
            Welcome to sphereai
          </h1>
          <p className="text-[#d0cfcf]">Setting your account</p>
        </div>

        <div className="mb-6">
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[#333]">
            <div
              className="h-full bg-gradient-to-r from-[#FF5E00] to-[#e54d00] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-[#d0cfcf]">{status}</p>
        </div>

        {!isProcessing && progress === 0 && (
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-[#FF5E00] px-6 py-2 text-white transition-colors hover:bg-[#e54d00]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Show organization info if available */}
        {user?.organizationMemberships &&
          user.organizationMemberships.length > 0 && (
            <div className="mt-6 rounded-lg border border-[#333] bg-[#1a1a1a] p-4">
              <p className="text-sm text-[#d0cfcf]">
                Organization:{" "}
                {user.organizationMemberships?.[0]?.organization?.name ??
                  user.organizationMemberships?.[0]?.organization?.id ??
                  "Unknown"}
              </p>
              <p className="text-xs text-[#FF5E00]">
                Role: {user.organizationMemberships?.[0]?.role ?? "Unknown"}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
