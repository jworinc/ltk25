import { useState, useCallback } from 'react';

const goodScorePraising = [
  'Good Job!',
  'Wonderful!',
  'Outstanding!'
];
const badScorePraising = [
  "Let's try harder",
  "Let's work harder",
  'Keep trying',
];

export function useDisplayResults() {
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [praise, setPraise] = useState('');

  const isEmpty = useCallback(() => praise === '' && right === 0 && wrong === 0, [praise, right, wrong]);

  const clear = useCallback(() => {
    setPraise('');
    setRight(0);
    setWrong(0);
  }, []);

  const setPraisePhrase = useCallback(() => {
    if (right + wrong === 0) {
      setPraise('');
      return;
    }
    if (right / (right + wrong) >= 0.7) {
      setPraise(goodScorePraising[Math.floor(Math.random() * goodScorePraising.length)]);
    } else {
      setPraise(badScorePraising[Math.floor(Math.random() * badScorePraising.length)]);
    }
  }, [right, wrong]);

  const setResult = useCallback((r: number, w: number) => {
    setRight(r);
    setWrong(w);
    // setPraise will run after state updates, so use callback
    setTimeout(setPraisePhrase, 0);
  }, [setPraisePhrase]);

  return {
    right,
    wrong,
    praise,
    isEmpty,
    clear,
    setPraise: setPraisePhrase,
    setResult,
    goodScorePraising,
    badScorePraising,
  };
}
