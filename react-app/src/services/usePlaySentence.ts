import { useCallback, useRef } from 'react';
import { usePlayMedia } from './usePlayMedia';

/**
 * usePlaySentence hook
 * Enables sentence audio playback on click, mimicking Angular's playsentence.directive.ts
 * @param sentence - The sentence string to split and play word-by-word
 * @param getAudioPath - Function to get audio file path for a word (word: string, idx: number) => string
 * @param options - Optional config (e.g., silentPlay, onPlayEnd)
 * @returns { ref, playSentence, playing }
 */
export function usePlaySentence(sentence: string, getAudioPath: (word: string, idx: number) => string, options?: { silentPlay?: boolean; onPlayEnd?: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { play } = usePlayMedia(''); // Pass mediaStorage root if needed
  const playing = useRef(false);

  // Clean and split sentence into words
  const cleanWord = (word: string) => word.replace(/[.?,:"()!;“”`’]/g, '');
  const words = sentence.split(' ').map(cleanWord).filter(Boolean);

  // Play words in sequence
  const playSentence = useCallback(async () => {
    if (options?.silentPlay) return;
    playing.current = true;
    for (let i = 0; i < words.length; i++) {
      await new Promise<void>(resolve => {
        play(getAudioPath(words[i], i), () => resolve());
      });
    }
    playing.current = false;
    if (options?.onPlayEnd) options.onPlayEnd();
  }, [sentence, getAudioPath, options]);

  // Attach click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playing.current) playSentence();
  }, [playSentence]);

  return { ref, playSentence, handleClick, playing: playing.current };
}

// Usage Example:
// const { ref, handleClick } = usePlaySentence(sentence, (w, i) => `/audio/${w}.mp3`);
// <div ref={ref} onClick={handleClick}>{sentence}</div>
