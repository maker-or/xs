import { Monitoring } from "react-scan/monitoring/next";
import "~/styles/globals.css";
import "~/styles/circuit-bricks.css"; // Import Circuit-Bricks styles
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
import Script from "next/script";
import RoleRedirect from "~/components/ui/RoleRedirect";
import SpecialRoutes from "~/components/ui/SpecialRoutes";
import ThemeScript from "~/components/ui/ThemeScript";
import ConvexClientProvider from "~/components/ConvexClientProvider";
import { dark } from '@clerk/themes'
// import ReactScan from "~/components/ui/ReactScan";

export const metadata: Metadata = {
  title: "Sphere",
  description: "AI-powered knowledge management platform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider waitlistUrl="/"
    appearance={{
      baseTheme: dark
    }}>
      <ConvexClientProvider>
        <CSPostHogProvider>
          <html lang="en" className={`font-sans`} suppressHydrationWarning>
            <Head>
              <title>Sphereai</title>
              <meta name="description" content="Your collage Your AI" />

              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
              />
            </Head>
            <Script
              src="https://unpkg.com/react-scan/dist/auto.global.js"
              strategy="afterInteractive"
            />
            <body>
              {/* Theme script moved to a client component to avoid hydration issues */}
              <Monitoring
                apiKey="demo" // Safe to expose publically
                url="https://monitoring.react-scan.com/api/v1/ingest"
                commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
                branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
              />
              <ThemeScript />

              <SignedOut>
                <SpecialRoutes>{children}</SpecialRoutes>
              </SignedOut>

              <SignedIn>
                <RoleRedirect />
                <Analytics />
                <SpeedInsights />

                <TimeProvider>
                  <div className="bg-[#000000]">
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
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
