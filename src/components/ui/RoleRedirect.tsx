'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function RoleRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Allow if already in student, teacher, ai, or repo paths
    if (
      pathname.startsWith('/student') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/ai') ||
      pathname.startsWith('/loading') ||
      pathname.startsWith('/repo')||
       pathname.startsWith('/test')
    ) {
      return;
    }

    // Redirect /folder/[id] to /student/folder/[id]
    if (pathname.startsWith('/folder/')) {
      const folderId = pathname.split('/')[2];
      if (folderId) {
        router.replace(`/student/folder/${folderId}`);
        return;
      }
    }

    // Redirect to loading page which will handle role determination
    router.replace('/loading');
  }, [isLoaded, isSignedIn, pathname, router]);

  return null;
}
