import "~/styles/globals.css";
import { ClerkProvider, SignIn, SignedIn, SignedOut } from "@clerk/nextjs";
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
import Script from "next/script";
import { Monitoring } from "react-scan/monitoring/next";
import Head from "next/head";
import First from "~/components/ui/First";
import Para from "~/components/ui/Para";
import Header from "~/components/ui/Header";

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
          <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          </Head>
          <body>
            {/* Move the Script component here */}

            <SignedOut>
              <div className=" h-[100svh] w-[100svw] text-red-700 flex-col items-center justify-center ">
              <Header />
                <First />
                <Para />
                {/* <SignIn routing="hash"  /> */}
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