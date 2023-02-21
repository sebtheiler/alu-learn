import type { IncomingMessage } from "http";

/**
 * Gets the remote address, user agent, and referer for the request
 * @param req Request to get metadata for
 * @returns The remote address, user agent, and referer for the request
 */
const getRequestMetadata = (req: IncomingMessage) => {
  const forwarded = req.headers["x-forwarded-for"] as string | undefined;
  const remoteAddr = forwarded
    ? forwarded.split(/, /)[0]
    : req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"];
  const referer = req.headers["referer"];

  return { remoteAddr, userAgent, referer };
};

export default getRequestMetadata;
