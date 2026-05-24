import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extracts an error message from an unknown error object.
 * Usage: catch (error: unknown) { setError(getErrorMessage(error)) }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  return "An unknown error occurred";
}
