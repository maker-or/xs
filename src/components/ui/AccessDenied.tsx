"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";
import { UserType } from "~/lib/auth-utils";

interface AccessDeniedProps {
  userType: UserType;
  attemptedRoute: string;
}

export default function AccessDenied({ userType, attemptedRoute }: AccessDeniedProps) {
  const router = useRouter();

  const getRecommendedAction = () => {
    switch (userType) {
      case "google_user":
        return {
          message: "Google account users have access to the learning platform only.",
          actionText: "Go to Learning",
          actionRoute: "/learning",
          upgradeMessage: "To access additional features, please sign up with your college account."
        };
      case "college_user":
        return {
          message: "You don't have permission to access this area.",
          actionText: "Go to Dashboard",
          actionRoute: "/student",
          upgradeMessage: "Contact your administrator if you need additional permissions."
        };
      case "admin":
        return {
          message: "This area is not available.",
          actionText: "Go to Dashboard",
          actionRoute: "/teacher",
          upgradeMessage: ""
        };
      default:
        return {
          message: "You don't have permission to access this area.",
          actionText: "Go Home",
          actionRoute: "/select",
          upgradeMessage: "Please sign in with the appropriate account type."
        };
    }
  };

  const recommendation = getRecommendedAction();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-4">
      <div className="w-full max-w-md text-center">
        {/* Access Denied Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <svg
            className="h-10 w-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-7V9m0 0V7m0 2h2m-2 0H10m6 3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="mb-4 text-2xl font-light text-white">
          Access Denied
        </h1>
        
        <p className="mb-6 text-[#d0cfcf]">
          {recommendation.message}
        </p>

        {/* User Type Badge */}
        <div className="mb-6 inline-flex items-center rounded-full border border-[#333] bg-[#1a1a1a] px-3 py-1 text-sm">
          <div className="mr-2 h-2 w-2 rounded-full bg-blue-400"></div>
          <span className="text-[#d0cfcf]">
            {userType === "google_user" && "Google Account"}
            {userType === "college_user" && "College Account"}
            {userType === "admin" && "Admin Account"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#313131] p-3 text-white hover:bg-[#f7eee3] hover:text-[#313131]"
            onClick={() => router.push(recommendation.actionRoute)}
          >
            {recommendation.actionText}
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-[#333] bg-transparent p-3 text-[#d0cfcf] hover:bg-[#333] hover:text-white"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Upgrade Message */}
        {recommendation.upgradeMessage && (
          <p className="mt-6 text-sm text-[#888]">
            {recommendation.upgradeMessage}
          </p>
        )}

        {/* Attempted Route Info */}
        <div className="mt-8 rounded-lg border border-[#333] bg-[#1a1a1a] p-3">
          <p className="text-xs text-[#888]">
            Attempted to access: <span className="text-[#d0cfcf]">{attemptedRoute}</span>
          </p>
        </div>
      </div>
    </div>
  );
} 