"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Icons } from "~/components/ui/icons";
import { cn } from "~/lib/utils";

export default function SignInPage() {
  return (
    <main className="relative h-[100svh] w-[100svw] overflow-hidden bg-[#0c0c0c]">
      {/* Noise background */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "512px 512px",
        }}
      />

      {/* Overlay grid and circles */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Vertical lines */}
        <div className="absolute left-[20%] top-0 h-full w-[2px] bg-white/20" />
        <div className="absolute left-[80%] top-0 h-full w-[2px] bg-white/20" />
        {/* Horizontal lines */}
        <div className="absolute left-[20%] top-[9%] h-[2px] w-[60%] bg-white/20" />
        <div className="absolute left-[20%] top-[90%] h-[2px] w-[60%] bg-white/20" />
        {/* Corner circles */}
        <div className="absolute left-[20%] top-[9%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[80%] top-[9%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[20%] top-[90%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        <div className="absolute left-[80%] top-[90%] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute left-8 top-8 z-30 flex items-center text-base text-white/70 transition-colors duration-200 hover:text-white"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={32} className="mr-2" />
        Back
      </Link>

      {/* Main content */}
      <div className="relative z-30 flex h-full w-full items-center justify-center p-8">
        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading: boolean) => (
              <>
                <SignIn.Step name="start">
                  <Card className="flex h-full w-full flex-col border-none">
                    <CardHeader className="text-start">
                      <CardTitle className="text-4xl font-light tracking-tighter text-white">
                        Welcome Back
                      </CardTitle>
                    </CardHeader>
                    <Clerk.Connection
                      name="microsoft"
                      className="flex w-full items-center justify-center gap-x-3 rounded-md bg-neutral-700 px-3.5 py-2.5 text-sm font-medium text-white shadow-[0_1px_0_0_theme(colors.white/5%)_inset,0_0_0_1px_theme(colors.white/2%)_inset] outline-none hover:bg-gradient-to-b hover:from-white/5 hover:to-white/5 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-white active:bg-gradient-to-b active:from-black/20 active:to-black/20 active:text-white/70"
                    >
                      Login with Microsoft
                    </Clerk.Connection>
                  </Card>
                </SignIn.Step>
              </>
            )}
          </Clerk.Loading>
        </SignIn.Root>
      </div>
    </main>
  );
}
