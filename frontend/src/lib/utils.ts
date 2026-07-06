import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes without conflicts.
 * Standard utility for shadcn/ui components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves an image URL so it works seamlessly both locally and on deployed websites (Vercel/Production).
 * - If the URL is already an absolute HTTP/HTTPS link, return it directly.
 * - If in production (Vercel) or a static /images/ path, serve directly from static root.
 * - If in local development, prepend local backend URL for /uploads/.
 */
export function getImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (import.meta.env.PROD || url.startsWith("/images/")) {
    return url;
  }
  return `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}${url}`;
}
