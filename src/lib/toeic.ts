// Practice modes, modelled on the ETS TOEIC Speaking test (11 questions).

export type ModeId =
  | "read-aloud"
  | "describe-picture"
  | "respond-questions"
  | "respond-info"
  | "express-opinion"
  | "free-talk";

export interface PracticeMode {
  id: ModeId;
  title: string;
  questions: string;
  description: string;
  timing: string;
  needsImage?: boolean;
}

export const MODES: PracticeMode[] = [
  {
    id: "read-aloud",
    title: "Read a text aloud",
    questions: "Câu 1–2",
    description: "Đọc to một đoạn văn ngắn. Chấm phát âm, ngữ điệu và trọng âm.",
    timing: "Chuẩn bị 45s · Nói 45s",
  },
  {
    id: "describe-picture",
    title: "Describe a picture",
    questions: "Câu 3–4",
    description: "Mô tả chi tiết một bức ảnh bạn tải lên hoặc ảnh ngẫu nhiên.",
    timing: "Chuẩn bị 45s · Nói 30s",
    needsImage: true,
  },
  {
    id: "respond-questions",
    title: "Respond to questions",
    questions: "Câu 5–7",
    description: "Trả lời 3 câu hỏi phỏng vấn ngắn về một chủ đề quen thuộc.",
    timing: "Chuẩn bị 3s · Nói 15s / 15s / 30s",
  },
  {
    id: "respond-info",
    title: "Respond using information",
    questions: "Câu 8–10",
    description: "Đọc lịch trình/bảng thông tin và trả lời câu hỏi của người gọi.",
    timing: "Đọc 45s · Nói 15s / 15s / 30s",
  },
  {
    id: "express-opinion",
    title: "Express an opinion",
    questions: "Câu 11",
    description: "Nêu quan điểm và lập luận có lý do, ví dụ cụ thể.",
    timing: "Chuẩn bị 45s · Nói 60s",
  },
  {
    id: "free-talk",
    title: "Free conversation",
    questions: "Tự do",
    description: "Trò chuyện tự nhiên với AI để luyện phản xạ, được sửa lỗi nhẹ nhàng.",
    timing: "Không giới hạn thời gian",
  },
];

export function getMode(id: string): PracticeMode | undefined {
  return MODES.find((m) => m.id === id);
}

// The model ends every task with this tag; the app hides it and runs the countdown.
const TIMER_TAG = /\[\[TIMER prep=(\d+) response=(\d+)\]\]/;

export interface TaskTimer {
  prep: number;
  response: number;
}

export function parseTimer(text: string): TaskTimer | null {
  const match = text.match(TIMER_TAG);
  if (!match) return null;
  return { prep: Number(match[1]), response: Number(match[2]) };
}

export function stripTimer(text: string): string {
  // Also hides a tag that is still streaming in, e.g. "[[TIMER pre".
  return text.replace(TIMER_TAG, "").replace(/\[\[[^\]]*$/, "").trimEnd();
}
