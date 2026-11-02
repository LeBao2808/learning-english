import type { Content } from "@google/genai";
import { ai, geminiErrorText, withFallback } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/prompts";
import { getMode } from "@/lib/toeic";
import { ERROR_MARKER, IMAGE_MEDIA_TYPES, type ChatMessage, type ChatRequest } from "@/lib/types";

// The timeout only covers opening the stream; a reply that has started may take as long as it needs.
const OPEN_TIMEOUT_MS = 8000;

const MAX_MESSAGES = 80;
const MAX_TEXT_LENGTH = 6000;
const MAX_IMAGE_BASE64_LENGTH = 7_000_000; // ~5 MB decoded

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const msg = m as Partial<ChatMessage>;
  if (msg.role !== "user" && msg.role !== "assistant") return false;
  if (typeof msg.content !== "string" || msg.content.length > MAX_TEXT_LENGTH) return false;
  if (msg.image !== undefined) {
    if (msg.role !== "user") return false;
    if (!IMAGE_MEDIA_TYPES.includes(msg.image.mediaType)) return false;
    if (typeof msg.image.data !== "string" || msg.image.data.length > MAX_IMAGE_BASE64_LENGTH) return false;
  }
  return true;
}

function toContent(m: ChatMessage): Content {
  const parts: Content["parts"] = [];
  if (m.image) parts.push({ inlineData: { mimeType: m.image.mediaType, data: m.image.data } });
  parts.push({ text: m.content });
  // Gemini calls the assistant role "model".
  return { role: m.role === "assistant" ? "model" : "user", parts };
}

export async function POST(req: Request) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const mode = getMode(body.mode);
  if (!mode) return Response.json({ error: "Unknown mode" }, { status: 400 });
  if (
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    body.messages.length > MAX_MESSAGES ||
    !body.messages.every(isValidMessage) ||
    body.messages[0].role !== "user"
  ) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const contents = body.messages.map(toContent);
        const systemInstruction = buildSystemPrompt(mode.id, Boolean(body.explainInVietnamese));
        const stream = await withFallback(
          (model, abortSignal) =>
            ai.models.generateContentStream({ model, contents, config: { systemInstruction, abortSignal } }),
          req.signal,
          OPEN_TIMEOUT_MS,
        );
        let blocked = false;
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
          if (chunk.promptFeedback?.blockReason || chunk.candidates?.[0]?.finishReason === "SAFETY") blocked = true;
        }
        if (blocked) {
          controller.enqueue(encoder.encode("\n\n_AI không thể trả lời yêu cầu này. Hãy thử lại với nội dung khác._"));
        }
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("[api/chat]", err);
          controller.enqueue(encoder.encode(`${ERROR_MARKER}${geminiErrorText(err)}`));
        }
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed because the browser cancelled the response.
        }
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
