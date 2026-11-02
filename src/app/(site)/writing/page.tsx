import type { Metadata } from "next";
import Link from "next/link";
import { WRITING_TASKS } from "@/lib/writing";

export const metadata: Metadata = {
  title: "Luyện Writing",
  description: "Luyện 8 câu TOEIC Writing: xem cấu trúc, mẫu câu, bài mẫu rồi viết và được AI chấm điểm chi tiết.",
};

const ICONS: Record<string, string> = { "picture-sentence": "🖼️", "email-response": "✉️", "opinion-essay": "📝" };

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="chip">TOEIC Writing</span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Học cấu trúc, viết, rồi được chấm ngay</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Mỗi dạng bài có dàn ý, mẫu câu ghi điểm và bài mẫu đạt điểm tối đa để xem trước. Sau khi viết, AI chấm theo
        rubric ETS, sửa từng lỗi và viết lại bài ở mức điểm cao nhất.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {WRITING_TASKS.map((task) => (
          <Link key={task.id} href={`/writing/${task.id}`} className="card group flex flex-col p-6 transition hover:border-primary">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{ICONS[task.id]}</span>
              <span className="chip">{task.questions}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold group-hover:text-primary">{task.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{task.description}</p>
            <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-surface-2 px-3 py-2">
                <dt className="text-xs text-muted">Thang điểm</dt>
                <dd className="font-semibold">0–{task.maxScore}</dd>
              </div>
              <div className="rounded-lg bg-surface-2 px-3 py-2">
                <dt className="text-xs text-muted">Thời gian gợi ý</dt>
                <dd className="font-semibold">{task.minutes} phút</dd>
              </div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
