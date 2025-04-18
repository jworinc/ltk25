import { useEffect, useRef } from 'react';

/**
 * useFontAdjuster hook
 * Dynamically adjusts font size of an element based on its content length and container size.
 * @param fontCorrection (optional) - value to subtract from calculated font size
 * @param deps (optional) - dependencies to trigger recalculation (e.g. content)
 * @returns ref to attach to the target element
 */
export function useFontAdjuster(fontCorrection: number = 0, deps: any[] = []) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const elm = ref.current;
    if (elm) {
      const bl = elm.innerText.length;
      const bw = elm.clientWidth;
      const bh = elm.clientHeight;
      if (bl > 0 && bw > 0 && bh > 0) {
        const x = Math.sqrt((bw * bh) / bl);
        let f = Math.round((45.2 + (13 * x)) / 16.88);
        f = f - fontCorrection;
        elm.style.fontSize = f + 'px';
      }
    }
    // Optionally, you could add a window resize listener for responsive adjustment
    // (not included here for simplicity)
  }, [fontCorrection, ...deps]);

  return ref;
}

// Usage Example:
// const fontRef = useFontAdjuster(0, [content]);
// <div ref={fontRef}>{content}</div>
