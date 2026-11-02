export const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

export interface ChatImage {
  mediaType: ImageMediaType;
  /** Base64 without the data: prefix. */
  data: string;
}

/** Shape sent from the browser to /api/chat. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: ChatImage;
}

/** Appended to the streamed reply when the request fails part-way; the text after it is the error. */
export const ERROR_MARKER = "\n\n[[ERROR]]";

export interface PronunciationRequest {
  /** Base64 16 kHz mono WAV, without the data: prefix. */
  audio: string;
  /** What speech recognition heard. */
  transcript: string;
  /** The text the learner was meant to read, for Read aloud. */
  reference?: string;
  explainInVietnamese: boolean;
}

export interface MispronouncedWord {
  word: string;
  /** Correct pronunciation in IPA (General American). */
  ipa: string;
  /** Rough respelling of how the learner said it. */
  heard: string;
  issue: string;
  tip: string;
}

export interface PronunciationReport {
  /** All scores are 0–100. */
  overall: number;
  accuracy: number;
  fluency: number;
  intonation: number;
  summary: string;
  words: MispronouncedWord[];
}

export interface ChatRequest {
  mode: string;
  explainInVietnamese: boolean;
  messages: ChatMessage[];
}
