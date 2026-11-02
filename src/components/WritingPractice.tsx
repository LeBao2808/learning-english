"use client";

import { useEffect, useRef, useState } from "react";
import { chatImageSrc, fetchRandomPhoto } from "@/lib/image";
import type { ChatImage } from "@/lib/types";
import { countWords, type WritingPrompt, type WritingReport, type WritingTask } from "@/lib/writing";

type Stage =
  | { kind: "study" }
  | { kind: "loading-prompt" }
  | { kind: "writing"; prompt: WritingPrompt; image?: ChatImage; startedAt: number }
  | { kind: "grading"; prompt: WritingPrompt; image?: ChatImage }
  | { kind: "graded"; prompt: WritingPrompt; image?: ChatImage; report: WritingReport };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Máy chủ trả về lỗi ${res.status}`);
  return data as T;
}

export default function WritingPractice({ task }: { task: WritingTask }) {
  const [stage, setStage] = useState<Stage>({ kind: "study" });
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [explainVi, setExplainVi] = useState(true);
  const recentRef = useRef<string[]>([]);

  const newPrompt = async () => {
    setError(null);
    setAnswer("");
    setStage({ kind: "loading-prompt" });
    try {
      const image = task.id === "picture-sentence" ? await fetchRandomPhoto() : undefined;
      const prompt = await postJson<WritingPrompt>("/api/writing/prompt", {
        task: task.id,
        image,
        avoid: recentRef.current,
      });
      recentRef.current = [...recentRef.current, prompt.content || prompt.words.join(" / ")].slice(-5);
      setStage({ kind: "writing", prompt, image, startedAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tạo được đề.");
      setStage({ kind: "study" });
    }
  };

  const submit = async () => {
    if (stage.kind !== "writing" || !answer.trim()) return;
    const { prompt, image } = stage;
    setError(null);
    setStage({ kind: "grading", prompt, image });
    try {
      const report = await postJson<WritingReport>("/api/writing/grade", {
        task: task.id,
        prompt,
        image,
        answer,
        explainInVietnamese: explainVi,
      });
      setStage({ kind: "graded", prompt, image, report });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không chấm được bài.");
      setStage({ kind: "writing", prompt, image, startedAt: Date.now() });
    }
  };

  const hasPrompt = stage.kind === "writing" || stage.kind === "grading" || stage.kind === "graded";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <StudyPanel task={task} />

      <div className="space-y-4">
        {!hasPrompt && (
          <div className="card p-6">
            <span className="chip">Bước 2</span>
            <h2 className="mt-3 text-xl font-bold">Sẵn sàng viết?</h2>
            <p className="mt-2 text-muted">
              Xem kỹ cấu trúc và bài mẫu bên cạnh. Khi bấm bắt đầu, AI sẽ ra một đề mới như đề thi thật và đồng hồ gợi ý{" "}
              {task.minutes} phút bắt đầu chạy.
            </p>
            <button onClick={newPrompt} disabled={stage.kind === "loading-prompt"} className="btn-primary mt-5">
              {stage.kind === "loading-prompt" ? "Đang tạo đề…" : "Bắt đầu viết"}
            </button>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        {hasPrompt && <PromptCard prompt={stage.prompt} image={stage.image} />}

        {(stage.kind === "writing" || stage.kind === "grading") && (
          <div className="card p-5">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
              {stage.kind === "writing" && <Timer startedAt={stage.startedAt} minutes={task.minutes} />}
              <WordCount text={answer} min={task.minWords} />
              <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-muted">
                <input type="checkbox" checked={explainVi} onChange={(e) => setExplainVi(e.target.checked)} />
                Nhận xét bằng tiếng Việt
              </label>
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              readOnly={stage.kind === "grading"}
              spellCheck={false}
              rows={task.id === "picture-sentence" ? 3 : task.id === "email-response" ? 12 : 18}
              placeholder={task.id === "picture-sentence" ? "Viết một câu..." : "Bắt đầu viết bài của bạn tại đây..."}
              className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 leading-relaxed outline-none focus:border-primary"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={submit} disabled={stage.kind === "grading" || !answer.trim()} className="btn-primary">
                {stage.kind === "grading" ? "AI đang chấm bài…" : "Nộp bài và chấm điểm"}
              </button>
              <button onClick={newPrompt} disabled={stage.kind === "grading"} className="btn-secondary">
                Đổi đề khác
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">Kiểm tra chính tả đã tắt, giống máy thi thật.</p>
          </div>
        )}

        {stage.kind === "graded" && (
          <>
            <ReportCard report={stage.report} answer={answer} />
            <div className="flex flex-wrap gap-3">
              <button onClick={newPrompt} className="btn-primary">
                Làm đề mới
              </button>
              <button
                onClick={() => setStage({ kind: "writing", prompt: stage.prompt, image: stage.image, startedAt: Date.now() })}
                className="btn-secondary"
              >
                Sửa bài và chấm lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudyPanel({ task }: { task: WritingTask }) {
  const [tab, setTab] = useState<"structure" | "phrases" | "sample">("structure");
  const tabs = [
    { id: "structure", label: "Cấu trúc" },
    { id: "phrases", label: "Mẫu câu" },
    { id: "sample", label: "Bài mẫu" },
  ] as const;

  return (
    <aside className="card h-fit p-5 lg:sticky lg:top-20">
      <span className="chip">Bước 1 · Xem trước khi viết</span>
      <div className="mt-4 flex gap-1 rounded-xl bg-surface-2 p-1 text-sm" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-1.5 font-medium transition ${
              tab === t.id ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 text-sm">
        {tab === "structure" && (
          <ol className="space-y-4">
            {task.structure.map((step) => (
              <li key={step.title}>
                <p className="font-semibold">{step.title}</p>
                <p className="mt-0.5 text-muted">{step.detail}</p>
                {step.example && (
                  <p className="mt-1.5 whitespace-pre-line rounded-lg bg-primary-soft px-3 py-2 font-medium text-primary">
                    {step.example}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}

        {tab === "phrases" && (
          <div className="space-y-4">
            {task.phrases.map((group) => (
              <div key={group.label}>
                <p className="font-semibold">{group.label}</p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {group.phrases.map((p) => (
                    <li key={p} className="rounded-lg border border-border bg-background px-2.5 py-1">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {tab === "sample" && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Đề</p>
              <p className="mt-1 whitespace-pre-line">{task.sample.prompt}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bài đạt điểm tối đa</p>
              <p className="mt-1 whitespace-pre-line rounded-lg bg-surface-2 px-3 py-2.5 leading-relaxed">
                {task.sample.answer}
              </p>
            </div>
            <p className="rounded-lg bg-highlight-soft px-3 py-2 text-foreground">💡 {task.sample.note}</p>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-border pt-4 text-sm">
        <p className="font-semibold">Mẹo nhanh</p>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-muted">
          {task.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PromptCard({ prompt, image }: { prompt: WritingPrompt; image?: ChatImage }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Directions</p>
      <p className="mt-1 font-medium">{prompt.directions}</p>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, nothing to optimise
        <img src={chatImageSrc(image)} alt="Ảnh đề bài" className="mt-4 max-h-80 w-full rounded-xl object-cover" />
      )}
      {prompt.words.length > 0 && (
        <p className="mt-4 text-center text-2xl font-bold tracking-wide text-primary">{prompt.words.join("  /  ")}</p>
      )}
      {prompt.content && (
        <p className="mt-4 whitespace-pre-line rounded-xl bg-surface-2 px-4 py-3 leading-relaxed">{prompt.content}</p>
      )}
    </div>
  );
}

function Timer({ startedAt, minutes }: { startedAt: number; minutes: number }) {
  const [now, setNow] = useState(startedAt);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.round(minutes * 60 - (now - startedAt) / 1000);
  const over = remaining < 0;
  const abs = Math.abs(remaining);
  const text = `${over ? "+" : ""}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`;
  return (
    <span
      className={`rounded-lg px-2.5 py-1 font-semibold tabular-nums ${
        over ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-surface-2"
      }`}
      title={over ? "Đã quá thời gian gợi ý" : "Thời gian còn lại"}
    >
      ⏱ {text}
    </span>
  );
}

function WordCount({ text, min }: { text: string; min?: number }) {
  const count = countWords(text);
  const enough = !min || count >= min;
  return (
    <span className={`rounded-lg px-2.5 py-1 tabular-nums ${enough ? "bg-surface-2" : "bg-highlight-soft"}`}>
      {count} từ{min ? ` / tối thiểu ${min}` : ""}
    </span>
  );
}

function ReportCard({ report, answer }: { report: WritingReport; answer: string }) {
  const ratio = report.maxScore ? report.score / report.maxScore : 0;
  const tone = ratio >= 0.8 ? "text-emerald-600 dark:text-emerald-400" : ratio >= 0.5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <div className="card divide-y divide-border">
      <div className="flex flex-wrap items-center gap-6 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Điểm câu này</p>
          <p className={`text-4xl font-extrabold tabular-nums ${tone}`}>
            {report.score}
            <span className="text-xl text-muted">/{report.maxScore}</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ước tính thang 200</p>
          <p className="text-2xl font-bold tabular-nums">~{report.scaledEstimate}</p>
        </div>
        <p className="min-w-60 flex-1 text-sm text-muted">{report.summary}</p>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {report.criteria.map((c) => (
          <div key={c.name} className="rounded-xl bg-surface-2 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{c.name}</p>
              <span className="shrink-0 font-bold tabular-nums">{c.score}/5</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary" style={{ width: `${(c.score / 5) * 100}%` }} />
            </div>
            <p className="mt-2 text-muted">{c.comment}</p>
          </div>
        ))}
      </div>

      <div className="p-5">
        <p className="font-semibold">Sửa lỗi ({report.corrections.length})</p>
        {report.corrections.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Không có lỗi đáng kể. Rất tốt!</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {report.corrections.map((c, i) => (
              <li key={i} className="rounded-xl border border-border p-3">
                <p>
                  <del className="text-red-600 dark:text-red-400">{c.original}</del>{" "}
                  <span className="text-muted">→</span>{" "}
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{c.corrected}</span>
                </p>
                <p className="mt-1 text-muted">{c.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div>
          <p className="font-semibold">Bài của bạn</p>
          <p className="mt-2 whitespace-pre-line rounded-xl bg-surface-2 p-3 text-sm leading-relaxed">{answer}</p>
        </div>
        <div>
          <p className="font-semibold">Bài đã nâng cấp</p>
          <p className="mt-2 whitespace-pre-line rounded-xl bg-primary-soft p-3 text-sm leading-relaxed">
            {report.improvedAnswer}
          </p>
        </div>
      </div>

      {report.tips.length > 0 && (
        <div className="p-5 text-sm">
          <p className="font-semibold">Mẹo cho lần sau</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {report.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
