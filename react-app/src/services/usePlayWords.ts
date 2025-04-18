import { useCallback, useRef } from 'react';
import { usePlayMedia } from './usePlayMedia';

/**
 * usePlayWords hook
 * Enables word-by-word audio playback for a given array of words, mimicking Angular's playwords.directive.ts
 * @param words - Array of words to play
 * @param getAudioPath - Function to get audio file path for a word (word: string, idx: number) => string
 * @param options - Optional config (e.g., silentPlay, onPlayEnd)
 * @returns { playWords, playing }
 */
export function usePlayWords(words: string[], getAudioPath: (word: string, idx: number) => string, options?: { silentPlay?: boolean; onPlayEnd?: () => void }) {
  const { play } = usePlayMedia(''); // Pass mediaStorage root if needed
  const playing = useRef(false);

  // Play words in sequence
  const playWords = useCallback(async () => {
    if (options?.silentPlay) return;
    playing.current = true;
    for (let i = 0; i < words.length; i++) {
      await new Promise<void>(resolve => {
        play(getAudioPath(words[i], i), () => resolve());
      });
    }
    playing.current = false;
    if (options?.onPlayEnd) options.onPlayEnd();
  }, [words.join(','), getAudioPath, options]);

  return { playWords, playing: playing.current };
}

// Usage Example:
// const { playWords } = usePlayWords(["cat", "dog"], (w, i) => `/audio/${w}.mp3`);
// <button onClick={playWords}>Play Words</button>
