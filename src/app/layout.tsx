import { Monitoring } from 'react-scan/monitoring/next';
import '~/styles/globals.css';
import '~/styles/circuit-bricks.css'; // Import Circuit-Bricks styles
import { NextSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import Head from 'next/head';
import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script';
import { extractRouterConfig } from 'uploadthing/server';
// Temporarily disable PostHog auth wrapper tied to Clerk
// import { CSPostHogProvider } from '~/app/_analytics/providers';
import ConvexClientProvider from '~/components/ConvexClientProvider';
import CommandPlate from '~/components/ui/CommandPlate';

import ThemeScript from '~/components/ui/ThemeScript';
import { TimeProvider } from '~/providers/TimerProvider';
import { FolderProvider } from '../components/ui/FolderContext';
import { ourFileRouter } from './api/uploadthing/core';
// import ReactScan from "~/components/ui/ReactScan";

export const metadata: Metadata = {
  title: 'Sphere',
  description: 'AI-powered knowledge management platform',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
  <ClerkProvider>
    <ConvexClientProvider>
      <html className={'font-sans'} lang="en" suppressHydrationWarning>
        <Head>
          <title>Sphereai</title>
          <meta content="Your collage Your AI" name="description" />

          <link href="https://fonts.googleapis.com" rel="preconnect" />
          <link
            crossOrigin="anonymous"
            href="https://fonts.gstatic.com"
            rel="preconnect"
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
            branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF}
            commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
            url="https://monitoring.react-scan.com/api/v1/ingest" // optional but recommended
          />
          <ThemeScript />

          {/* Render without Clerk gating; access is controlled within pages */}

          <Analytics />
          <SpeedInsights />

          <TimeProvider>
            <div className="bg-[#000000]">
              <CommandPlate />
              <FolderProvider>
                <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
                {children}
              </FolderProvider>
            </div>
          </TimeProvider>
        </body>
      </html>
    </ConvexClientProvider>
  </ClerkProvider>
  );
}
