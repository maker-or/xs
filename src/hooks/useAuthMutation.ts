import { useAuth } from "@clerk/nextjs";
import { useMutation as useConvexMutation, useAction as useConvexAction } from "convex/react";
import { ConvexError } from "convex/values";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

// Wrapper for useMutation that checks for authentication
export const useAuthMutation = <T extends FunctionReference<"mutation">>(mutation: T) => {
  const { isSignedIn } = useAuth();
  const convexMutation = useConvexMutation(mutation);

  return (args: FunctionArgs<T>) => {
    if (!isSignedIn) {
      throw new ConvexError("Not authenticated");
    }
    return convexMutation(args);
  };
};

// Wrapper for useAction that checks for authentication
export const useAuthAction = <T extends FunctionReference<"action">>(action: T) => {
  const { isSignedIn } = useAuth();
  const convexAction = useConvexAction(action);

  return (args: FunctionArgs<T>) => {
    if (!isSignedIn) {
      throw new ConvexError("Not authenticated");
    }
    return convexAction(args);
  };
};

