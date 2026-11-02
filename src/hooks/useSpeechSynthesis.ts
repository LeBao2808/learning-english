"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Turns Markdown into plain sentences that sound natural when read aloud. */
export function markdownToSpeech(markdown: string): string {
  return markdown
    .replace(/~~[^~]*~~/g, "") // struck-through original mistakes
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*\|.*$/gm, "") // tables are for reading, not listening
    .replace(/[#*_`>]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/→/g, ", ")
    .replace(/\n{2,}/g, ".\n")
    .trim();
}

const noSubscribe = () => () => {};

export function useSpeechSynthesis(lang = "en-US") {
  const supported = useSyncExternalStore(noSubscribe, () => "speechSynthesis" in window, () => false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(lang.slice(0, 2)));
      // Prefer higher-quality online voices when the browser offers them.
      voiceRef.current =
        voices.find((v) => v.lang === lang && /natural|google|online/i.test(v.name)) ??
        voices.find((v) => v.lang === lang) ??
        voices[0] ??
        null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      window.speechSynthesis.cancel();
    };
  }, [lang]);

  /** Resolves when speech finishes or is cancelled. */
  const speak = useCallback(
    (text: string, rate = 0.95): Promise<void> =>
      new Promise((resolve) => {
        if (!("speechSynthesis" in window) || !text.trim()) return resolve();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        if (voiceRef.current) utterance.voice = voiceRef.current;
        utterance.onend = utterance.onerror = () => {
          setSpeaking(false);
          resolve();
        };
        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }),
    [lang],
  );

  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}
