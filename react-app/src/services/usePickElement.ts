import { useRef, useState } from 'react';

export function usePickElement() {
  const [mouseLock, setMouseLock] = useState(false);
  const [currentElement, setCurrentElement] = useState<any>(null);
  const [prevElement, setPrevElement] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const elementSet = useRef<(el: any) => void>();

  const setLock = () => {
    setMouseLock(true);
    setError(null);
    setReady(false);
    document.body.style.cursor = 'pointer';
  };
  const unsetLock = () => {
    setMouseLock(false);
    setError(null);
    setReady(false);
    document.body.style.cursor = 'inherit';
  };
  const setNewElement = (el: any) => {
    setCurrentElement(el);
    setError(null);
    setReady(false);
    if (mouseLock) {
      setPrevElement(el);
      // highlight logic could go here
      setReady(true);
      if (elementSet.current) elementSet.current(el);
    } else {
      setError('Mouse is not locked');
    }
  };
  return {
    mouseLock,
    setLock,
    unsetLock,
    currentElement,
    prevElement,
    setNewElement,
    elementSet,
    error,
    ready
  };
}
