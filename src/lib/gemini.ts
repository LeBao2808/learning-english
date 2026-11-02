import "server-only";
import { ApiError, GoogleGenAI, type Part } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
// Used when the main model is overloaded (503), out of quota (429) or slow to answer, all common on the free tier.
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL ?? "gemini-flash-lite-latest";
const ATTEMPTS = [MODEL, FALLBACK_MODEL];

/**
 * Runs `call` on the main model, then on the fallback model if the main one fails in a way the
 * fallback may not. `timeoutMs` bounds each non-final attempt; an overloaded model can take
 * 10+ seconds just to return its 503, or hang.
 */
export async function withFallback<T>(
  call: (model: string, signal: AbortSignal) => Promise<T>,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<T> {
  for (let i = 0; ; i++) {
    const isLast = i === ATTEMPTS.length - 1;
    const attempt = new AbortController();
    const forwardAbort = () => attempt.abort();
    signal.addEventListener("abort", forwardAbort);
    const timer = isLast ? undefined : setTimeout(() => attempt.abort(), timeoutMs);
    try {
      return await call(ATTEMPTS[i], attempt.signal);
    } catch (err) {
      // Only unlink on failure: a returned stream must still stop when the browser disconnects.
      signal.removeEventListener("abort", forwardAbort);
      const timedOut = attempt.signal.aborted && !signal.aborted;
      // 429 too: free-tier quotas are per model, so the fallback usually still has requests left.
      const overloaded = err instanceof ApiError && [429, 500, 503].includes(err.status);
      if (isLast || signal.aborted || !(timedOut || overloaded)) throw err;
      const reason = timedOut ? "timed out" : `returned ${err instanceof ApiError ? err.status : ""}`;
      console.warn(`[gemini] ${ATTEMPTS[i]} ${reason}, trying ${ATTEMPTS[i + 1]}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

/** One request whose reply must match `schema`; returns the parsed JSON. */
export async function generateJson<T>(parts: Part[], schema: object, signal: AbortSignal, timeoutMs: number): Promise<T> {
  const response = await withFallback(
    (model, abortSignal) =>
      ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: { responseMimeType: "application/json", responseJsonSchema: schema, abortSignal },
      }),
    signal,
    timeoutMs,
  );
  return JSON.parse(response.text ?? "") as T;
}

/** A JSON error response with a message the learner can act on. */
export function geminiErrorResponse(err: unknown, route: string): Response {
  console.error(`[${route}]`, err);
  const message = err instanceof SyntaxError ? "AI trả về kết quả không đọc được. Thử lại nhé." : geminiErrorText(err);
  return Response.json({ error: message }, { status: 502 });
}

export function geminiErrorText(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400 && /api key/i.test(err.message)) {
      return "API key Gemini không hợp lệ. Kiểm tra GEMINI_API_KEY trong file .env.";
    }
    if (err.status === 403) return "API key Gemini không có quyền truy cập model này.";
    if (err.status === 429) {
      return "Đã vượt giới hạn lượt gọi của Gemini (gói miễn phí giới hạn số lượt mỗi phút/ngày). Đợi một lúc rồi thử lại.";
    }
    if (err.status === 503 || err.status === 500) {
      return "Gemini đang quá tải, đã thử lại nhưng chưa được. Đợi vài giây rồi thử lại.";
    }
    if (err.status === 404) return "Không tìm thấy model Gemini. Kiểm tra GEMINI_MODEL trong file .env.";
    return `Lỗi từ Gemini API (${err.status}): ${err.message}`;
  }
  if (!process.env.GEMINI_API_KEY) {
    return "Chưa cấu hình API key. Hãy đặt GEMINI_API_KEY trong file .env rồi khởi động lại server.";
  }
  return "Đã xảy ra lỗi không xác định khi gọi AI.";
}
