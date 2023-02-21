import React, { useEffect } from "react";

/**
 * Hook that calls a function when there is a click outside of the passed ref
 * @param ref Triggers function when clicked outside of this ref
 * @param onOutsideClick Function to call when there is a click outside of the passed ref
 * @see https://stackoverflow.com/a/42234988/10226703 CC BY-SA 4.0
 */
export default function useOutsideClick(
  ref: React.RefObject<HTMLElement> | HTMLElement,
  onOutsideClick: (event: MouseEvent) => void
) {
  const el = ref && ("current" in ref ? ref.current : ref);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (el && !el.contains(event.target as Node)) {
        onOutsideClick(event);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, el, onOutsideClick]);
}
