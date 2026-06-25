import { useEffect, RefObject } from "react";

/**
 * Custom React hook that detects and fires a callback function when a click or touch event
 * occurs completely outside of a targeted DOM element wrapper.
 *
 * @param ref - A React mutable ref object pointing to the HTML element container we want to protect (e.g., a dropdown or modal container).
 * @param callback - The functional state manipulator or action to execute when an outside click is confirmed (e.g., `() => setIsOpen(false)`).
 */
export function useOutsideClick(
  // Typings support any valid HTML node wrapped by React's mutable reference object shell
  ref: RefObject<HTMLElement | null>,
  callback: () => void,
) {
  useEffect(() => {
    /**
     * Internal event handler triggered globally on every user interaction window-wide.
     * Maps across both desktop mouse devices and modern mobile capacitive touchscreens.
     */
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      // 1. Guard clause: Ensure the DOM node currently exists in the live document lifecycle.
      // 2. DOM Tree validation: Check if the element captured by the event dispatcher (.target)
      //    is contained within the layout boundaries of our component container.
      // 3. Typeassertion: Safely cast the raw event target into a generic DOM Node object.
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Attach active event interceptors to the global document object.
    // 'mousedown' intercepts the exact moment a mouse button is pressed downward.
    // 'touchstart' intercepts the immediate surface touch event on mobile screens, mitigating click delays.
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    /**
     * Garbage collection/Cleanup function.
     * Automatically unbinds global listeners from the global document context when the
     * consuming component unmounts from the virtual DOM or when dependency trees change.
     * This step is mandatory to stop processing stale memory pointers and prevent leaks.
     */
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };

    // Explicit dependencies: Re-run this setup side-effect safely if either the memory
    // pointer instance or the developer-defined callback closure undergoes mutation.
  }, [ref, callback]);
}
