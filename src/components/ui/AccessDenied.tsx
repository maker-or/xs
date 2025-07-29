"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { UserType } from "~/lib/auth-utils";

interface AccessDeniedProps {
  userType: UserType;
  attemptedRoute: string;
}

export default function AccessDenied({
  userType,
  attemptedRoute,
}: AccessDeniedProps) {
  const router = useRouter();

  const getRecommendedAction = () => {
    switch (userType) {
      case "google_user":
        return {
          message: "you have access to the learning platform only.",
          actionText: "Go to Learning",
          actionRoute: "/learning",
          upgradeMessage:
            "To access additional features, please sign up with your college account.",
        };
      case "college_user":
        return {
          message: "You don't have permission to access this area.",
          actionText: "Go to Dashboard",
          actionRoute: "/student",
          upgradeMessage:
            "Contact your administrator if you need additional permissions.",
        };
      case "admin":
        return {
          message: "This area is not available.",
          actionText: "Go to Dashboard",
          actionRoute: "/teacher",
          upgradeMessage: "",
        };
      default:
        return {
          message: "You don't have permission to access this area.",
          actionText: "Go Home",
          actionRoute: "/select",
          upgradeMessage: "Please sign in with the appropriate account type.",
        };
    }
  };

  const recommendation = getRecommendedAction();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg p-8 text-center shadow-xl">
        {/* Access Denied Icon with Animation */}
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 transition-transform duration-300 hover:scale-105">
          <svg
            className="h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Access Denied Icon"
          >
            <title>Locked Access</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="mb-4 text-3xl font-normal text-white">Access Denied</h1>

        <p className="mb-8 text-lg text-[#d0cfcf]">{recommendation.message}</p>

        {/* Action Buttons with Transitions */}
        <div className="space-y-4">
          <Button
            className="w-full rounded-md bg-[#313131] py-3 text-white transition-colors duration-200 hover:bg-[#f7eee3] hover:text-[#313131]"
            onClick={() => router.push(recommendation.actionRoute)}
            aria-label={recommendation.actionText}
          >
            {recommendation.actionText}
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-md border-[#333] bg-transparent py-3 text-[#d0cfcf] transition-colors duration-200 hover:bg-[#333] hover:text-white"
            onClick={() => router.back()}
            aria-label="Go Back"
          >
            Go Back
          </Button>
        </div>

        {/* Upgrade Message */}
        {recommendation.upgradeMessage && (
          <p className="mt-8 text-sm text-[#888]">
            {recommendation.upgradeMessage}{" "}
            <a
              href="/upgrade" // Replace with actual upgrade route
              className="text-red-400 underline hover:text-red-300"
            >
              Learn more
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
