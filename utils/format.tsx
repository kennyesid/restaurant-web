import { IMAGE_DEFAULT } from "@/lib/constants/constants";

export const getImageUrl = (url?: string): string => {
  if (!url) return `data:image/avif;base64,${IMAGE_DEFAULT}`;
  return url.startsWith('data:') ? url : `data:image/avif;base64,${url}`;
};