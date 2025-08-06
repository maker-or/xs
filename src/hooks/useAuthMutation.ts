import { useAuth } from '@clerk/nextjs';
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
  const { isSignedIn } = useAuth();
  const convexMutation = useConvexMutation(mutation);

  return (args: FunctionArgs<T>) => {
    if (!isSignedIn) {
      throw new ConvexError('Not authenticated');
    }
    return convexMutation(args);
  };
};

// Wrapper for useAction that checks for authentication
export const useAuthAction = <T extends FunctionReference<'action'>>(
  action: T
) => {
  const { isSignedIn } = useAuth();
  const convexAction = useConvexAction(action);

  return (args: FunctionArgs<T>) => {
    if (!isSignedIn) {
      throw new ConvexError('Not authenticated');
    }
    return convexAction(args);
  };
};
