import { useAuth } from "@clerk/nextjs";
import { useMutation as useConvexMutation, useAction as useConvexAction } from "convex/react";
import { ConvexError } from "convex/values";

// Wrapper for useMutation that checks for authentication
export const useAuthMutation = (mutation: any) => {
  const { isSignedIn } = useAuth();
  const convexMutation = useConvexMutation(mutation);

  return (args: any) => {
    if (!isSignedIn) {
      throw new ConvexError("Not authenticated");
    }
    return convexMutation(args);
  };
};

// Wrapper for useAction that checks for authentication
export const useAuthAction = (action: any) => {
  const { isSignedIn } = useAuth();
  const convexAction = useConvexAction(action);

  return (args: any) => {
    if (!isSignedIn) {
      throw new ConvexError("Not authenticated");
    }
    return convexAction(args);
  };
};

