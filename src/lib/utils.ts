/**
 * Utility library for CSS class manipulation
 * 
 * This module provides the `cn` utility function for conditionally combining
 * and merging CSS class names. It uses clsx for conditional classes and
 * tailwind-merge for intelligent Tailwind CSS class deduplication.
 */

// Required imports for class manipulation
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names intelligently
 * 
 * This function accepts multiple class inputs (strings, objects, arrays)
 * and returns a single merged string. It handles Tailwind CSS conflicts
 * by keeping the last conflicting class (e.g., "bg-red-500 bg-blue-500" 
 * becomes "bg-blue-500").
 * 
 * @param inputs - Variable number of class inputs (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * cn("bg-red-500", "bg-blue-500") // Returns "bg-blue-500" 
 * cn("px-4", { "py-2": true, "py-4": false }) // Returns "px-4 py-2"
 * cn(["text-sm", "font-bold"], undefined, "text-center") // Returns "text-sm font-bold text-center"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}