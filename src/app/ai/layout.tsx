import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import "./styles.css"; // Import the new AI-specific styles
import { ThemeProvider } from "~/utils/theme-provider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "sphereai",
  description:
    "The AI chat app for students. which helps students to get the answer of their queries.",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Script
        src="https://google.github.io/typograms/typograms.js"
        strategy="beforeInteractive"
        data-oid=":1b-1zn"
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        data-oid="qwpthsd"
      >
        {children}
      </ThemeProvider>
    </>
  );
}
