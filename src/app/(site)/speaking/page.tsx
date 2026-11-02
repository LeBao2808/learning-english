import type { Metadata } from "next";
import Link from "next/link";
import { MODES } from "@/lib/toeic";

export const metadata: Metadata = {
  title: "Luyện Speaking",
  description: "Luyện 11 câu TOEIC Speaking với AI: đếm giờ như thi thật, chấm điểm, chấm phát âm và bài mẫu.",
};

const ICONS: Record<string, string> = {
  "read-aloud": "📖",
  "describe-picture": "🖼️",
  "respond-questions": "💬",
  "respond-info": "📋",
  "express-opinion": "🗣️",
  "free-talk": "☕",
};

export default function SpeakingPage() {
  const exam = MODES.filter((m) => m.id !== "free-talk");
  const free = MODES.find((m) => m.id === "free-talk");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="chip">TOEIC Speaking</span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Luyện nói theo từng dạng câu hỏi</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Chọn dạng câu hỏi, nói câu trả lời qua micro. AI chấm theo tiêu chí ETS, sửa lỗi, đưa bài mẫu và nghe giọng bạn để
        chấm phát âm.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exam.map((mode) => (
          <Link key={mode.id} href={`/practice/${mode.id}`} className="card group flex flex-col p-5 transition hover:border-primary">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{ICONS[mode.id]}</span>
              <span className="chip">{mode.questions}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{mode.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{mode.description}</p>
            <p className="mt-4 text-xs font-medium text-muted">⏱ {mode.timing}</p>
          </Link>
        ))}
      </div>

      {free && (
        <Link
          href={`/practice/${free.id}`}
          className="card mt-6 flex flex-col gap-3 p-6 transition hover:border-primary sm:flex-row sm:items-center"
        >
          <span className="text-3xl">{ICONS[free.id]}</span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{free.title}</h2>
            <p className="mt-1 text-sm text-muted">{free.description}</p>
          </div>
          <span className="btn-primary">Bắt đầu trò chuyện</span>
        </Link>
      )}

      <div className="mt-10 grid gap-4 text-sm sm:grid-cols-3">
        {[
          ["🎧", "Đeo tai nghe", "Để micro không thu lại giọng đọc của AI."],
          ["🌐", "Dùng Chrome hoặc Edge", "Hai trình duyệt nhận diện giọng nói tốt nhất."],
          ["⏱", "Bật tính giờ như thi thật", "Hết giờ chuẩn bị micro tự bật, hết giờ nói tự nộp bài."],
        ].map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl bg-surface-2 p-4">
            <p className="font-semibold">
              {icon} {title}
            </p>
            <p className="mt-1 text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
