import { useRef, useState } from 'react';
import { Howl } from 'howler';

export function useMediaPreloader(mediaStorage: string) {
  const buffer = useRef<Howl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const preloadAudio = (relativePath: string) => {
    setError(null);
    setReady(false);
    const url = mediaStorage + relativePath;
    const howl = new Howl({
      src: url,
      preload: true
    });
    howl.on('load', () => setReady(true));
    howl.on('loaderror', (id, err) => setError('Failed to preload audio'));
    buffer.current.push(howl);
  };

  // For images, just create an Image and set src
  const preloadImage = (relativePath: string) => {
    setError(null);
    setReady(false);
    const img = new window.Image();
    img.onload = () => setReady(true);
    img.onerror = () => setError('Failed to preload image');
    img.src = mediaStorage + relativePath;
  };

  return {
    preloadAudio,
    preloadImage,
    buffer,
    error,
    ready
  };
}
