// Utility library imports for CSS class manipulation
import { twMerge } from "tailwind-merge"
import { twMerge } from "tailwind-merge"

 * 
 * 
 * 
 * Example usage:
 * cn("bg-red-500", "bg-blue-500") // Returns "bg-blue-500" (later class wins
export function cn(...inputs: ClassValue[]) {
}


 * 
 * Example usage:

 * cn("bg-red-500", "bg-blue-500") // Returns "bg-blue-500" (later class wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
