import { API_BASE_URL } from "../config/api";

/**
 * Constructs the full image URL from a stored path
 * Handles both local paths (/uploads/animals/...) and external URLs
 */
export const getImageUrl = (photoPath: string | null | undefined): string => {
  if (!photoPath) {
    return "https://via.placeholder.com/400?text=No+Image";
  }

  // If it's already a full URL (http/https), return as is
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  // If it's a local path, construct full URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = photoPath.startsWith("/") ? photoPath.slice(1) : photoPath;
  return `${API_BASE_URL}/${cleanPath}`;
};

