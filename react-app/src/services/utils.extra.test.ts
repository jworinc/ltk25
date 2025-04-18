import { capitalize, debounce, clamp, uniqueBy } from './utils';

describe('extra utils', () => {
  it('capitalize capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });

  it('clamp clamps a number between min and max', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(-1, 0, 3)).toBe(0);
    expect(clamp(100, 0, 50)).toBe(50);
  });

  it('uniqueBy returns unique items by key', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' },
    ];
    expect(uniqueBy(arr, x => x.id)).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ]);
  });

  it('debounce delays function execution', done => {
    let count = 0;
    const incr = debounce(() => { count++; }, 50);
    incr();
    incr();
    setTimeout(() => {
      expect(count).toBe(1);
      done();
    }, 70);
  });
});
