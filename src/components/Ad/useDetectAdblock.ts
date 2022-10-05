import { useEffect, useState } from "react";

/**
 * Is the user using adblock? Client-side only
 * @returns If the user is using adblock?
 * @see https://github.com/aruniverse/adblock-detect-react/blob/master/adblock-detect-react/src/hooks/useDetectAdBlock.ts
 */
export default function useDetectAdBlock(isPro) {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean | undefined>(
    undefined
  );

  // FIXME: this doesn't work
  useEffect(() => {
    if (typeof isPro !== "boolean") return;

    // grab a domain from https://github1s.com/gorhill/uBlock/blob/master/docs/tests/hostname-pool.js
    const url =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    })
      .then(() => setAdBlockDetected(false))
      .catch(() => {
        setAdBlockDetected(true);
      });
  }, [isPro]);

  return adBlockDetected;
}
