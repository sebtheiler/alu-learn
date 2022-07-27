import { useState, useEffect } from "react";

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

/**
 * Gets the width and height of the window. Updates when the window is resized
 * @returns The width and height of the current window
 * @see https://stackoverflow.com/a/36862446/10226703
 */
export default function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [didInitialLoad, setDidInitialLoad] = useState(false);

  useEffect(() => {
    if (!didInitialLoad) {
      setWindowDimensions(getWindowDimensions());
      setDidInitialLoad(true);
    }

    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [didInitialLoad]);

  return windowDimensions;
}
