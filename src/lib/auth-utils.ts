import { UserResource } from "@clerk/types";

export type UserType = "google_user" | "college_user" | "admin";

export interface UserAccessLevel {
  type: UserType;
  canAccessLearning: boolean;
  canAccessStudent: boolean;
  canAccessTeacher: boolean;
  canAccessRepo: boolean;
  canAccessCalendar: boolean;
  canAccessTest: boolean;
}

/**
 * Determine user type based on authentication method and metadata
 */
export function getUserType(user: UserResource, authType?: string): UserType {
  // Check if user came through Google OAuth
  if (authType === "google" || user.externalAccounts?.some(account => account.provider === "google")) {
    return "google_user";
  }
  
  // Check if user is admin based on role or metadata
  if (user.publicMetadata?.role === "admin" || user.organizationMemberships?.some(membership => membership.role === "admin")) {
    return "admin";
  }
  
  // Default to college user for Microsoft OAuth or email/password
  return "college_user";
}

/**
 * Get access level for a user type
 */
export function getUserAccessLevel(userType: UserType): UserAccessLevel {
  switch (userType) {
    case "google_user":
      return {
        type: "google_user",
        canAccessLearning: true,
        canAccessStudent: false,
        canAccessTeacher: false,
        canAccessRepo: false,
        canAccessCalendar: false,
        canAccessTest: false,
      };
    
    case "college_user":
      return {
        type: "college_user",
        canAccessLearning: true,
        canAccessStudent: true,
        canAccessTeacher: false,
        canAccessRepo: true,
        canAccessCalendar: true,
        canAccessTest: true,
      };
    
    case "admin":
      return {
        type: "admin",
        canAccessLearning: true,
        canAccessStudent: true,
        canAccessTeacher: true,
        canAccessRepo: true,
        canAccessCalendar: true,
        canAccessTest: true,
      };
    
    default:
      return {
        type: "google_user",
        canAccessLearning: true,
        canAccessStudent: false,
        canAccessTeacher: false,
        canAccessRepo: false,
        canAccessCalendar: false,
        canAccessTest: false,
      };
  }
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userType: UserType, pathname: string): boolean {
  const accessLevel = getUserAccessLevel(userType);
  
  console.log(`canAccessRoute called with userType: ${userType}, pathname: ${pathname}`);
  console.log(`Access level:`, accessLevel);
  
  // Check specific route access
  if (pathname.startsWith("/learning")) {
    console.log(`Learning route access: ${accessLevel.canAccessLearning}`);
    return accessLevel.canAccessLearning;
  }
  
  if (pathname.startsWith("/student")) {
    return accessLevel.canAccessStudent;
  }
  
  if (pathname.startsWith("/teacher")) {
    return accessLevel.canAccessTeacher;
  }
  
  if (pathname.startsWith("/repo")) {
    return accessLevel.canAccessRepo;
  }
  
  if (pathname.startsWith("/calendar")) {
    return accessLevel.canAccessCalendar;
  }
  
  if (pathname.startsWith("/test")) {
    return accessLevel.canAccessTest;
  }
  
  // Allow access to public routes
  const publicRoutes = ["/", "/select", "/indauth", "/onboarding", "/privacy-policy", "/terms-of-service", "/pricing"];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return true;
  }
  
  return false;
}

/**
 * Get default redirect URL for user type
 */
export function getDefaultRedirectUrl(userType: UserType): string {
  switch (userType) {
    case "google_user":
      return "/learning";
    case "admin":
      return "/teacher";
    case "college_user":
    default:
      return "/student";
  }
} 