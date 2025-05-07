import "~/styles/globals.css";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";
import { type Metadata } from "next";
import { FolderProvider } from "../components/ui/FolderContext";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { Analytics } from "@vercel/analytics/react";
import { CSPostHogProvider } from "~/app/_analytics/providers";
import CommandPlate from "~/components/ui/CommandPlate";
import { TimeProvider } from "~/providers/TimerProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";
import RoleRedirect from "~/components/ui/RoleRedirect";
import SpecialRoutes from "~/components/ui/SpecialRoutes";
import ThemeScript from "~/components/ui/ThemeScript";

export const metadata: Metadata = {
  title: "Sphere",
  description: "AI-powered knowledge management platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <html lang="en" className={`font-sans`} suppressHydrationWarning>
          <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          </Head>
          <body>
            {/* Theme script moved to a client component to avoid hydration issues */}
            <ThemeScript />

            <SignedOut>
              <SpecialRoutes>{children}</SpecialRoutes>
            </SignedOut>

            <SignedIn>
              <RoleRedirect />
              <Analytics />
              <SpeedInsights />

              <TimeProvider>
                <div className="m-1 p-6">
                  <CommandPlate />
                  <FolderProvider>
                    <NextSSRPlugin
                      routerConfig={extractRouterConfig(ourFileRouter)}
                    />
                    {children}
                  </FolderProvider>
                </div>
              </TimeProvider>
            </SignedIn>
          </body>
        </html>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}