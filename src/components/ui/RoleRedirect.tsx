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
      pathname.startsWith('/repo')
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

    const userRole = localStorage.getItem('userRole');

    if (userRole === 'student') {
      router.replace('/student');
    } else if (userRole === 'teacher') {
      router.replace('/teacher');
    } else {
      router.replace('/role-selection');
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  return null;
}
