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
        <Analytics />
        <SpeedInsights/>

        <html lang="en" className={`font-sans`}>
          {/* <Head>
            <Link
              rel="preload"
              href="https://utfs.io/f/orc4evzyNtrgG0LJbanCWISJF71dBgAOkMqtNpGcUfix6uL2"
              as="image"
            />
          </Head> */}

          <body>
            <SignedOut>
              <div className="scroll-behavior: auto; flex h-screen w-screen flex-col items-center justify-center bg-[#0c0c0c]">
                <SignIn routing="hash" />
              </div>
            </SignedOut>

            <SignedIn>
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
