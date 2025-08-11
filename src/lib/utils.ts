// Utility library imports for CSS class manipulation
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for combining and merging CSS classes
 * 
 * This function combines the functionality of clsx (for conditional classes)
 * and tailwind-merge (for proper Tailwind CSS class merging). It's essential
 * for shadcn/ui components and custom styling.
 * 
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * Example usage:
 * cn("base-class", { "conditional-class": condition }, "another-class")
 * cn("bg-red-500", "bg-blue-500") // Returns "bg-blue-500" (later class wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
