import { useEffect } from "react";

/**
 * CursorGlow Component
 * Renders a subtle radial gradient that follows the user's mouse cursor.
 * 
 * - Tracks mouse position using vanilla JS event listeners
 * - Updates CSS variables --cursor-x and --cursor-y for performance
 * - Uses a fixed pseudo-layer defined in global CSS
 * - Automatically disabled on touch devices via CSS media queries
 */
export default function CursorGlow() {
  useEffect(() => {
    const updateCursorPosition = (e) => {
      // Direct DOM manipulation for maximum performance without React state
      // Using requestAnimationFrame to ensure smooth updates timed with refresh rate
      requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);
      });
    };

    window.addEventListener("mousemove", updateCursorPosition);

    return () => {
      window.removeEventListener("mousemove", updateCursorPosition);
      // Clean up variables to prevent stale state if re-mounted
      document.documentElement.style.removeProperty("--cursor-x");
      document.documentElement.style.removeProperty("--cursor-y");
    };
  }, []);

  return (
    <div 
      className="cursor-glow-layer" 
      aria-hidden="true"
    />
  );
}
