"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function RoleRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Allow if already in student, teacher, ai, repo, or onboarding paths
    if (
      pathname.startsWith("/student") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/ai") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/repo") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/test") ||
      pathname.startsWith("/learning") ||
      pathname.startsWith("/role-selection") ||
      pathname.startsWith("/privacy-policy") ||
      pathname.startsWith("/terms-of-service") ||
      pathname.startsWith("/accept-invitation/")
    ) {
      return;
    }
    // Redirect /folder/[id] to /student/folder/[id]
    if (pathname.startsWith("/folder/")) {
      const folderId = pathname.split("/")[2];
      if (folderId) {
        router.replace(`/student/folder/${folderId}`);
        return;
      }
    }

    // Redirect to onboarding page which will handle role determination
    router.replace("/onboarding");
  }, [isLoaded, isSignedIn, pathname, router]);

  return null;
}
