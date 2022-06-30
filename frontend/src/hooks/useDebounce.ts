import { useEffect, useState } from 'react';

// Adapted from https://usehooks.com/useDebounce/
export function useDebounce<T>(value: T, delay: number, callback?: () => void): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
        if (callback) callback();
      }, delay);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay, callback],
  );

  return debouncedValue;
}