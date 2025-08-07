'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export type RoleInfo = {
  userId?: string | null;
  appRole?: 'admin' | 'member' | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Custom hook to determine user role from Clerk session claims
 *
 * Returns:
 * - userId: The user ID from Clerk
 * - orgRole: The raw org_role value from Clerk session claims
 * - appRole: The application role (admin or member) derived from orgRole
 * - isLoading: Whether the role information is still being fetched
 * - error: Any error encountered during role fetching
 */
export function useUserRole(): RoleInfo {
  const { isLoaded, isSignedIn } = useUser();
  const [roleInfo, setRoleInfo] = useState<RoleInfo>({
    userId: null,

    appRole: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkRole = async () => {
      // Wait for Clerk to load
      if (!isLoaded) return;

      // If user is not signed in, no need to check role
      if (!isSignedIn) {
        setRoleInfo({
          userId: null,
          appRole: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        const res = await fetch('/api/auth/role');

        if (!res.ok) {
          throw new Error('Failed to fetch role information');
        }

        const data = await res.json();

        setRoleInfo({
          userId: data.userId,

          appRole: data.appRole,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRoleInfo((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to fetch role',
        }));
      }
    };

    checkRole();
  }, [isLoaded, isSignedIn]);

  return roleInfo;
}
