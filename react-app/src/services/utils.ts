/**
 * Utility: Filters an array of items by the languages specified in sku.languages (comma-separated string).
 * Equivalent to Angular's langfilter.pipe.ts
 */
export function langFilter<T extends { locale: string }>(items: T[], sku: { languages?: string }): T[] {
  if (!sku || !sku.languages) return items;
  const locales = sku.languages.split(',').map(l => l.trim());
  return items.filter(item => locales.includes(item.locale));
}

/**
 * Utility: Reverses an array. Equivalent to Angular's reverse.pipe.ts
 */
export function reverseArray<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

/**
 * Utility: Filters items by whether their menu_id is in the provided array. Equivalent to filter-by-array.pipe.ts
 */
export function filterByArray<T extends { menu_id: string | number }>(items: T[], arr: (string | number)[]): T[] {
  return items.filter(item => arr.includes(parseInt(item.menu_id as string, 10)));
}

/**
 * Utility: Safely sets inner HTML. Equivalent to Angular's bindhtml.pipe.ts (without sanitizer).
 * In React, use with caution: <div dangerouslySetInnerHTML={{ __html: html }} />
 * For sanitization, consider using 'dompurify'.
 */
export function sanitizeHtml(html: string): string {
  // Placeholder: In production, use DOMPurify or similar.
  return html;
}

/**
 * Utility: Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.length ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/**
 * Utility: Debounces a function (returns a debounced version).
 */
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Utility: Clamps a number between min and max.
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, num));
}

/**
 * Utility: Returns unique items in an array by a key function.
 */
export function uniqueBy<T>(arr: T[], key: (item: T) => any): T[] {
  const seen = new Set();
  return arr.filter(item => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
