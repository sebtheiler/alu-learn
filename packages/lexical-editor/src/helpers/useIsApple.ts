import { useMemo } from "react";

const useIsApple = () => {
  return useMemo(() => {
    try {
      return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    } catch {
      // SSR
      return false;
    }
  }, [])
}

export default useIsApple;