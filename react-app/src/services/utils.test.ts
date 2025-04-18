import { langFilter, reverseArray, filterByArray, sanitizeHtml } from './utils';

describe('utils', () => {
  it('langFilter filters by locale', () => {
    const items = [
      { locale: 'en' },
      { locale: 'fr' },
      { locale: 'es' },
    ];
    expect(langFilter(items, { languages: 'en,fr' })).toEqual([
      { locale: 'en' },
      { locale: 'fr' },
    ]);
  });

  it('reverseArray reverses an array', () => {
    expect(reverseArray([1, 2, 3])).toEqual([3, 2, 1]);
  });

  it('filterByArray filters by menu_id', () => {
    const items = [
      { menu_id: '1' },
      { menu_id: '2' },
      { menu_id: '3' },
    ];
    expect(filterByArray(items, [2, 3])).toEqual([
      { menu_id: '2' },
      { menu_id: '3' },
    ]);
  });

  it('sanitizeHtml returns the same string (placeholder)', () => {
    expect(sanitizeHtml('<b>Test</b>')).toBe('<b>Test</b>');
  });
});
