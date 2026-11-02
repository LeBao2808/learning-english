import type { Part } from "@google/genai";
import { generateJson, geminiErrorResponse } from "@/lib/gemini";
import { IMAGE_MEDIA_TYPES, type ChatImage } from "@/lib/types";
import { getWritingTask, type WritingPrompt, type WritingTaskId } from "@/lib/writing";

const TIMEOUT_MS = 15000;
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

const PROMPT_SCHEMA = {
  type: "object",
  properties: {
    directions: { type: "string" },
    content: { type: "string" },
    words: { type: "array", items: { type: "string" } },
  },
  required: ["directions", "content", "words"],
};

const INSTRUCTIONS: Record<WritingTaskId, string> = {
  "picture-sentence": `Create TOEIC Writing Questions 1–5 ("Write a sentence based on a picture") for the attached photo.
- words: exactly two words or short phrases the learner must use in one sentence about the photo, as on the real test (e.g. ["woman", "carry"], ["table", "because"], ["while", "talk"]). Pick words that clearly fit what is visible. Vary the pairing: noun + verb, noun + preposition, or a conjunction + verb.
- directions: "Write ONE sentence based on the picture. Use the two words or phrases shown. You may change the forms of the words and use them in any order."
- content: an empty string.`,
  "email-response": `Create TOEIC Writing Questions 6–7 ("Respond to a written request").
- content: a realistic workplace or customer-service email of 60–100 words with From, To, Subject and Sent lines, then the body. Vary the topic (events, orders, office changes, travel, training, new services...).
- directions: what the reply must contain, in the test's style, with explicit numbers in capitals, e.g. "Respond to the e-mail as if you are a new employee. In your e-mail, ask TWO questions and make ONE suggestion."
- words: an empty array.`,
  "opinion-essay": `Create TOEIC Writing Question 8 ("Write an opinion essay").
- content: one opinion question on a familiar work, education, technology or lifestyle topic, in one of the test's formats: agree/disagree with a statement, choose between two options, or what is most important. End with "Give reasons or examples to support your opinion."
- directions: "Read the question below. You have 30 minutes to plan, write, and revise your essay. Typically, an effective response will contain a minimum of 300 words."
- words: an empty array.`,
};

export async function POST(req: Request) {
  let body: { task?: string; image?: ChatImage; avoid?: string[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const task = getWritingTask(body.task ?? "");
  if (!task) return Response.json({ error: "Unknown task" }, { status: 400 });

  const parts: Part[] = [];
  if (task.id === "picture-sentence") {
    const image = body.image;
    if (!image || !IMAGE_MEDIA_TYPES.includes(image.mediaType) || image.data.length > MAX_IMAGE_BASE64_LENGTH) {
      return Response.json({ error: "Thiếu ảnh cho dạng bài này." }, { status: 400 });
    }
    parts.push({ inlineData: { mimeType: image.mediaType, data: image.data } });
  }
  // Recent prompts, so a learner practising several in a row does not get the same topic again.
  const avoid = (body.avoid ?? []).filter((s) => typeof s === "string").slice(-5).map((s) => s.slice(0, 200));
  parts.push({
    text: `${INSTRUCTIONS[task.id]}${avoid.length ? `\n\nUse a different topic from these recent prompts:\n- ${avoid.join("\n- ")}` : ""}`,
  });

  try {
    return Response.json(await generateJson<WritingPrompt>(parts, PROMPT_SCHEMA, req.signal, TIMEOUT_MS));
  } catch (err) {
    return geminiErrorResponse(err, "api/writing/prompt");
  }
}
