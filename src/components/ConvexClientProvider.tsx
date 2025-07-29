"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// for better auth
// import { authClient } from "../../lib/auth-client";
// import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>

    // for better authClient
    // <ConvexBetterAuthProvider client={convex} authClient={authClient}>
    //   {children}
    // </ConvexBetterAuthProvider>
  );
}
