"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import Header from "~/components/ui/Header";
import LandingPage from "~/components/ui/LandingPage";


export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/student");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return null;

  // Show landing page for unauthenticated users at root
  return (
    <div className="min-h-[100svh] w-[100vw] bg-black text-[#a0a0a0]">
      <Header />
      <LandingPage />
    </div>
  );
}
