import { useEffect, useState } from 'react';

// Adapted from https://github.com/aruniverse/adblock-detect-react/blob/master/adblock-detect-react/src/hooks/useDetectAdBlock.ts
export default function useDetectAdBlock() {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  // Try to access a blocked domain
  useEffect(() => {
    const url = "https://www3.doubleclick.net";
    fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    }).catch(
      () => setAdBlockDetected(true)
    );
  }, []);

  return adBlockDetected;
}
