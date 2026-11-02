import type { Part } from "@google/genai";
import { generateJson, geminiErrorResponse } from "@/lib/gemini";
import { IMAGE_MEDIA_TYPES, type ChatImage } from "@/lib/types";
import { countWords, getWritingTask, type WritingPrompt, type WritingReport } from "@/lib/writing";

// Grading a 300-word essay with corrections and a rewrite takes a while.
const TIMEOUT_MS = 30000;
const MAX_ANSWER_LENGTH = 8000;
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 5 },
    maxScore: { type: "integer" },
    scaledEstimate: {
      type: "integer",
      minimum: 0,
      maximum: 200,
      description: "TOEIC Writing scaled score (0-200) that answers of this level typically earn.",
    },
    summary: { type: "string", description: "Two or three sentences: overall impression and the single most important improvement." },
    criteria: {
      type: "array",
      description: "One entry per rubric criterion, scored 0-5.",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 5 },
          comment: { type: "string" },
        },
        required: ["name", "score", "comment"],
      },
    },
    corrections: {
      type: "array",
      maxItems: 10,
      description: "Real errors only, most important first. Empty if none.",
      items: {
        type: "object",
        properties: {
          original: { type: "string", description: "The learner's exact words." },
          corrected: { type: "string" },
          explanation: { type: "string" },
        },
        required: ["original", "corrected", "explanation"],
      },
    },
    improvedAnswer: {
      type: "string",
      description:
        "The learner's answer rewritten to the top score, keeping their ideas where possible. Keep the paragraph layout of a letter or essay, with blank lines (\\n\\n) between paragraphs.",
    },
    tips: { type: "array", maxItems: 3, items: { type: "string" } },
  },
  required: ["score", "maxScore", "scaledEstimate", "summary", "criteria", "corrections", "improvedAnswer", "tips"],
};

export async function POST(req: Request) {
  let body: { task?: string; prompt?: WritingPrompt; answer?: string; image?: ChatImage; explainInVietnamese?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const task = getWritingTask(body.task ?? "");
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  const prompt = body.prompt;
  if (!task || !prompt || typeof prompt.directions !== "string" || !answer || answer.length > MAX_ANSWER_LENGTH) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const parts: Part[] = [];
  if (task.id === "picture-sentence") {
    const image = body.image;
    if (!image || !IMAGE_MEDIA_TYPES.includes(image.mediaType) || image.data.length > MAX_IMAGE_BASE64_LENGTH) {
      return Response.json({ error: "Thiếu ảnh cho dạng bài này." }, { status: 400 });
    }
    parts.push({ inlineData: { mimeType: image.mediaType, data: image.data } });
  }

  const language = body.explainInVietnamese
    ? "Write summary, criteria comments, explanations and tips in Vietnamese. Keep corrections and improvedAnswer in English."
    : "Write everything in simple, clear English.";
  const wordInfo = task.minWords ? ` (${countWords(answer)} words; the test expects at least ${task.minWords})` : "";

  parts.push({
    text: `You are a certified ETS TOEIC Writing rater grading a Vietnamese learner.

Task type: ${task.title} (${task.questions}). Score it 0–${task.maxScore} with the official ETS rubric for this task type, and set maxScore to ${task.maxScore}.
Rubric criteria to report one by one (each 0–5): ${task.rubric.join("; ")}.

Directions given to the learner:
"""${prompt.directions}"""
${prompt.content ? `Task material:\n"""${prompt.content}"""\n` : ""}${prompt.words?.length ? `Required words: ${prompt.words.join(" / ")}\n` : ""}${task.id === "picture-sentence" ? "The attached photo is the picture the sentence must describe.\n" : ""}
Learner's answer${wordInfo}:
"""${answer}"""

Grade strictly but fairly, like a real rater: a missing required element, an unused required word or an off-topic answer caps the score low. Do not reward length beyond what the task needs.
For corrections, quote the learner's exact words in "original". improvedAnswer keeps the learner's ideas and length class, fixed to top-score quality.
${language}`,
  });

  try {
    const report = await generateJson<WritingReport>(parts, REPORT_SCHEMA, req.signal, TIMEOUT_MS);
    report.maxScore = task.maxScore;
    report.score = Math.min(report.score, task.maxScore);
    return Response.json(report);
  } catch (err) {
    return geminiErrorResponse(err, "api/writing/grade");
  }
}
