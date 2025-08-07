import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * A utility function that combines clsx and tailwind-merge to handle
 * class name merging with tailwind's conflict resolution.
 *
 * @param inputs - Class values to be merged
 * @returns - A merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
