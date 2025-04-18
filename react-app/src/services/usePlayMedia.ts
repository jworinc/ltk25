import { useRef, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

export function usePlayMedia(mediaStorage: string) {
  const [playDisable, setPlayDisable] = useState(false);
  const [playPause, setPlayPause] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const playSoundRef = useRef<Howl | null>(null);
  const playSequence = useRef<any[]>([]);

  const play = useCallback((path: string, cb?: () => void, del: number = 1) => {
    setError(null);
    setReady(false);
    if (playDisable || playPause) {
      playSequence.current.push({ path, cb, del });
      return;
    }
    setPlayDisable(true);
    const sound = new Howl({
      src: mediaStorage + path,
      volume,
      rate: rate >= 1 ? rate : 1,
      html5: false,
      autoplay: false,
      loop: false
    });
    playSoundRef.current = sound;
    sound.on('end', () => {
      setPlayDisable(false);
      setReady(true);
      if (cb) cb();
    });
    sound.on('load', () => {
      setReady(true);
    });
    sound.on('loaderror', (id, err) => {
      setPlayDisable(false);
      setError('Failed to load audio');
      if (cb) cb();
    });
    sound.on('playerror', (id, err) => {
      setPlayDisable(false);
      setError('Failed to play audio');
      if (cb) cb();
    });
    setTimeout(() => sound.play(), del);
  }, [mediaStorage, playDisable, playPause, volume, rate]);

  const pause = useCallback(() => {
    setPlayPause(true);
    if (playSoundRef.current) playSoundRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    setPlayPause(false);
    if (playSoundRef.current) playSoundRef.current.play();
  }, []);

  const stop = useCallback(() => {
    if (playSoundRef.current) playSoundRef.current.stop();
    playSoundRef.current = null;
    playSequence.current = [];
    setPlayDisable(false);
  }, []);

  return {
    play,
    pause,
    resume,
    stop,
    setVolume,
    setRate,
    playDisable,
    playPause,
    volume,
    rate,
    error,
    ready
  };
}
