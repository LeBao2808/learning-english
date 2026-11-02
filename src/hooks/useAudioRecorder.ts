"use client";

import { useCallback, useEffect, useRef } from "react";

function release(recorder: MediaRecorder | null) {
  recorder?.stream.getTracks().forEach((t) => t.stop());
}

/**
 * Records the microphone alongside speech recognition so the audio itself can be graded.
 * Failures are silent: recognition still works, there is just no pronunciation report.
 */
export function useAudioRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const stoppedRef = useRef<Promise<Blob | null>>(Promise.resolve(null));
  // Lets stop() wait for a start() that is still waiting on microphone permission.
  const startingRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => () => release(recorderRef.current), []);

  const start = useCallback(() => {
    const open = async () => {
      if (recorderRef.current || typeof MediaRecorder === "undefined") return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        stoppedRef.current = new Promise((resolve) => {
          recorder.onstop = () => {
            release(recorder);
            resolve(chunks.length ? new Blob(chunks, { type: recorder.mimeType }) : null);
          };
        });
        recorderRef.current = recorder;
        recorder.start();
      } catch (err) {
        console.warn("[recorder] could not start", err);
      }
    };
    startingRef.current = startingRef.current.then(open);
  }, []);

  /** Stops recording and resolves with the audio, or null when nothing was recorded. */
  const stop = useCallback(async (): Promise<Blob | null> => {
    await startingRef.current;
    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (!recorder) return null;
    if (recorder.state !== "inactive") recorder.stop();
    return stoppedRef.current;
  }, []);

  return { start, stop };
}
