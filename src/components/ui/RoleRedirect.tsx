"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { getUserType, canAccessRoute } from "~/lib/auth-utils";
import AccessDenied from "./AccessDenied";

export default function RoleRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [userType, setUserType] = useState<
    "google_user" | "college_user" | "admin"
  >("google_user");

  useEffect(() => {
    if (!isLoaded || !userLoaded || !isSignedIn || !user) return;

    // Determine user type
    const currentUserType = getUserType(user);
    setUserType(currentUserType);

    // Always allow access to public routes and auth routes
    const publicRoutes = [
      "/select",
      "/indauth",
      "/onboarding",
      "/role-selection",
      "/privacy-policy",
      "/terms-of-service",
      "/pricing",
      "/accept-invitation/",
      "/sign-in",
      "/sign-up",
      "/waitlist",
    ];

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return;
    }

    // Check if user can access the current route
    if (!canAccessRoute(currentUserType, pathname)) {
      console.log(
        `Access denied for ${currentUserType} trying to access ${pathname}`,
      );
      setShowAccessDenied(true);
      return;
    }

    // Hide access denied if user can access the route
    setShowAccessDenied(false);

    // Redirect /folder/[id] to /student/folder/[id] for college users
    if (pathname.startsWith("/folder/") && currentUserType !== "google_user") {
      const folderId = pathname.split("/")[2];
      if (folderId) {
        router.replace(`/student/folder/${folderId}`);
        return;
      }
    }

    // Handle root path redirect based on user type
    if (pathname === "/") {
      router.replace("/select");
      return;
    }
  }, [isLoaded, userLoaded, isSignedIn, user, pathname, router]);

  // Show access denied page if user doesn't have permission
  if (showAccessDenied) {
    return <AccessDenied userType={userType} attemptedRoute={pathname} />;
  }

  return null;
}
