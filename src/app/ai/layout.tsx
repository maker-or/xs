import type { Metadata } from 'next';
// import { GeistSans } from "geist/font/sans";
// import { GeistMono } from "geist/font/mono";
import './styles.css'; // Import the new AI-specific styles
import Script from 'next/script';
import { ThemeProvider } from '~/utils/theme-provider';

export const metadata: Metadata = {
  title: 'sphereai',
  description:
    'The AI chat app for students. which helps students to get the answer of their queries.',
  icons: '/favicon.ico',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Script
        data-oid=":1b-1zn"
        src="https://google.github.io/typograms/typograms.js"
        strategy="beforeInteractive"
      />
      <ThemeProvider
        attribute="class"
        data-oid="qwpthsd"
        defaultTheme="system"
        disableTransitionOnChange
        enableSystem
      >
        {children}
      </ThemeProvider>
    </>
  );
}
