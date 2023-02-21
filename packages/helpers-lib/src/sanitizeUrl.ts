/**
 * Sanitizes a URL
 * @param url The URL to sanitize
 * @returns The sanitized URL
 * @see https://github.com/facebook/lexical/blob/main/packages/lexical-playground/src/utils/sanitizeUrl.ts
 */
export const sanitizeUrl = (url: string): string => {
  /** A pattern that matches safe  URLs. */
  const SAFE_URL_PATTERN =
    /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^&:/?#]*(?:[/?#]|$))/gi;

  /** A pattern that matches safe data URLs. */
  const DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;

  url = String(url).trim();

  if (url.match(SAFE_URL_PATTERN) || url.match(DATA_URL_PATTERN)) return url;

  return `https://`;
};
