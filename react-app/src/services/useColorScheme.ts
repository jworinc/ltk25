import { useState, useCallback } from 'react';

const colorSchemes = [
  { card: '#FFFFFF' },
  { card: '#5961F9' },
  { card: '#076FB6' },
  { card: '#39B1BC' },
  { card: '#FF91F0' },
  { card: '#7CFFC2' },
  { card: '#D3C57C' },
  { card: '#FFA5A5' },
  { card: '#DFFF91' },
  { card: '#BABABA' },
  { card: '#FFDE9E' }
];

export function useColorScheme() {
  const [currentSet, setCurrentSet] = useState(0);

  const getCardBgColor = useCallback(() => colorSchemes[currentSet].card, [currentSet]);

  const setScheme = useCallback((scheme: number) => {
    if (scheme >= colorSchemes.length) {
      setCurrentSet(colorSchemes.length - 1);
    } else {
      setCurrentSet(scheme);
    }
  }, []);

  return {
    currentSet,
    colorSchemes,
    getCardBgColor,
    setScheme,
  };
}
