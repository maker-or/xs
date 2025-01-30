import "~/styles/globals.css";
import { ClerkProvider, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
// import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { FolderProvider } from "../components/ui/FolderContext";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { Analytics } from "@vercel/analytics/react";
import { CSPostHogProvider } from "~/app/_analytics/providers";
import CommandPlate from "~/components/ui/CommandPlate";
import { TimeProvider } from "~/providers/TimerProvider";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";
import { Monitoring } from "react-scan/monitoring/next";

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

        <html lang="en" className={`font-sans`}>
          <head>
            {/* other head tags */}
            <Script
              src="https://unpkg.com/react-scan/dist/install-hook.global.js"
              strategy="beforeInteractive"
            />
            <head>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
          </head>


          <body>
            <SignedOut>
              <div className="scroll-behavior: auto; flex h-screen w-screen flex-col items-center justify-center bg-[#0c0c0c]">
                <SignIn routing="hash" />
              </div>
            </SignedOut>

            <SignedIn>
              <Monitoring
                apiKey="6P6upcBmNTmn9O2OSBdG_UrxIJiW87dI" // Safe to expose publically
                url="https://monitoring.react-scan.com/api/v1/ingest"
                commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
                branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
              />
              <Analytics />
              <SpeedInsights />

              <TimeProvider>
                <div className="m-1 p-6">
                  {/* <Greeting/>
          <Navbar/>  */}
                  <CommandPlate />
                  {/* <Cmd/> */}
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
