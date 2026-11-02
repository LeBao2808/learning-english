import { generateJson, geminiErrorResponse } from "@/lib/gemini";
import type { PronunciationReport, PronunciationRequest } from "@/lib/types";

// Listening to the audio takes longer than opening a text stream.
const ATTEMPT_TIMEOUT_MS = 20000;
const MAX_AUDIO_BASE64_LENGTH = 4_000_000; // ~90 s of 16 kHz mono WAV
const MAX_TEXT_LENGTH = 3000;

const score = { type: "integer", minimum: 0, maximum: 100 };
const REPORT_SCHEMA = {
  type: "object",
  properties: {
    overall: score,
    accuracy: { ...score, description: "Correct sounds: consonants, vowels, word endings." },
    fluency: { ...score, description: "Smooth pace, few hesitations, fillers or restarts." },
    intonation: { ...score, description: "Word stress, sentence stress, rhythm and intonation." },
    summary: { type: "string", description: "Two or three sentences on the overall impression and the main thing to fix." },
    words: {
      type: "array",
      maxItems: 8,
      description: "Words actually mispronounced in the audio, most important first. Empty if none.",
      items: {
        type: "object",
        properties: {
          word: { type: "string", description: "The word as written." },
          ipa: { type: "string", description: "Correct General American IPA between slashes, stress marked." },
          heard: { type: "string", description: "Simple respelling of how the learner said it, e.g. 'wor-k' or 'tink'." },
          issue: { type: "string", description: "What was wrong, e.g. 'final /k/ dropped' or 'stress on 2nd syllable'." },
          tip: { type: "string", description: "One short, concrete way to fix it." },
        },
        required: ["word", "ipa", "heard", "issue", "tip"],
      },
    },
  },
  required: ["overall", "accuracy", "fluency", "intonation", "summary", "words"],
};

function buildInstruction(req: PronunciationRequest): string {
  const language = req.explainInVietnamese
    ? "Write summary, issue and tip in Vietnamese. Keep word, ipa and heard as they are."
    : "Write summary, issue and tip in simple English.";
  const target = req.reference
    ? `The learner was reading this text aloud:\n"""${req.reference}"""\nAlso count words that were skipped or replaced as accuracy problems.`
    : "The learner was answering a question freely, so judge only how the words they chose were pronounced, not grammar or content.";

  return `You are a strict but encouraging English pronunciation examiner for TOEIC Speaking, working with a Vietnamese learner.
Listen carefully to the attached recording and assess pronunciation from the audio itself.

${target}
A speech recogniser transcribed the recording as:\n"""${req.transcript || "(nothing recognised)"}"""
The transcript can be wrong; trust what you hear. A word the recogniser got wrong is often a word that was mispronounced.

Pay special attention to problems common for Vietnamese speakers: dropped or unreleased final consonants (/t/, /d/, /k/, /s/, /z/), missing -s and -ed endings, consonant clusters, /θ/ and /ð/, /ʃ/ vs /s/, /r/ vs /z/, short vs long vowels, flat word stress and a syllable-timed rhythm.
A Vietnamese accent is fine when it does not make a word hard to understand. Report only errors you actually hear; do not invent errors.

Score each area 0–100: 90+ near-native and very clear; 75–89 clear with minor errors; 60–74 understandable with noticeable errors; 40–59 frequent errors that make listening effortful; below 40 often hard to understand. "overall" weighs accuracy most.
If the recording is silent, too short or too noisy to judge, give 0 for every score, leave words empty and explain in summary.

${language}`;
}

export async function POST(req: Request) {
  let body: PronunciationRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof body.audio !== "string" ||
    body.audio.length === 0 ||
    body.audio.length > MAX_AUDIO_BASE64_LENGTH ||
    typeof body.transcript !== "string" ||
    body.transcript.length > MAX_TEXT_LENGTH ||
    (body.reference !== undefined && (typeof body.reference !== "string" || body.reference.length > MAX_TEXT_LENGTH))
  ) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const report = await generateJson<PronunciationReport>(
      [{ inlineData: { mimeType: "audio/wav", data: body.audio } }, { text: buildInstruction(body) }],
      REPORT_SCHEMA,
      req.signal,
      ATTEMPT_TIMEOUT_MS,
    );
    return Response.json(report);
  } catch (err) {
    return geminiErrorResponse(err, "api/pronunciation");
  }
}
