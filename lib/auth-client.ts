import { createAuthClient as createBaseAuthClient } from "better-auth/client";
import { createAuthClient as createReactAuthClient } from "better-auth/react";
import { emailOTPClient, genericOAuthClient } from "better-auth/client/plugins";
import { convexClient } from "@convex-dev/better-auth/client/plugins";


export const authClient = createBaseAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [emailOTPClient(), genericOAuthClient(), convexClient()],
});

export const reactAuthClient = createReactAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [emailOTPClient(), genericOAuthClient(), convexClient()],
});

export const { useSession } = reactAuthClient;
