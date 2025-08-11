'use client';

import { ConvexReactClient } from 'convex/react';
import type { ReactNode } from 'react';
import { reactAuthClient } from '../../lib/auth-client';
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react';

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file');
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={reactAuthClient}>
      {children}
    </ConvexBetterAuthProvider>
  );
}
