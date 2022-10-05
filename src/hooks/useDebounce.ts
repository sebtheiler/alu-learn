import { useEffect, useState } from "react";

/**
 * Debounce a fast changing value so that only the latest value is shown.
 * Value updates when the user stops typing.
 * Use in tandem with `useEffect` where the deps array is the debounced value.
 * @param value Value to debounce
 * @param delay Amount of time that the value must not change before the debounced value is updated
 * @returns The debounced value
 * @see https://usehooks.com/useDebounce/
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
