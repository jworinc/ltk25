import { useRef, useState, useCallback } from 'react';

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    setError(null);
    setReady(false);
    if (!navigator.mediaDevices) {
      setError('Media devices not supported');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];
      mediaRecorder.ondataavailable = (e) => {
        audioChunks.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioUrl(URL.createObjectURL(blob));
        setReady(true);
      };
      mediaRecorder.onerror = (e) => {
        setError('Recording error');
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err: any) {
      setError('Permission denied or error starting recording');
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    } else {
      setError('No recording in progress');
    }
  }, []);

  const clear = useCallback(() => {
    setAudioUrl(null);
    setRecording(false);
    setError(null);
    setReady(false);
    audioChunks.current = [];
  }, []);

  return {
    recording,
    audioUrl,
    start,
    stop,
    clear,
    error,
    ready
  };
}
