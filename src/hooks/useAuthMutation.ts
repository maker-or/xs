import { useConvexAuth } from "convex/react";
import {
  useAction as useConvexAction,
  useMutation as useConvexMutation,
} from 'convex/react';
import {
  type FunctionArgs,
  type FunctionReference,
  FunctionReturnType,
} from 'convex/server';
import { ConvexError } from 'convex/values';


// Wrapper for useMutation that checks for authentication
export const useAuthMutation = <T extends FunctionReference<'mutation'>>(
  mutation: T
) => {
  const { isAuthenticated,isLoading} = useConvexAuth();
  const convexMutation = useConvexMutation(mutation);

  return (args: FunctionArgs<T>) => {
    if (!isAuthenticated) {
      throw new ConvexError('Not authenticated');
    }
    return convexMutation(args);
  };
};

// Wrapper for useAction that checks for authentication
export const useAuthAction = <T extends FunctionReference<'action'>>(
  action: T
) => {
  const { isAuthenticated,isLoading} = useConvexAuth();
  const convexAction = useConvexAction(action);

  return (args: FunctionArgs<T>) => {
    if (!isAuthenticated) {
      throw new ConvexError('Not authenticated');
    }
    return convexAction(args);
  };
};
