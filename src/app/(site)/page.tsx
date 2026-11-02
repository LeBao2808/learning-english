import Link from "next/link";

const FEATURES = [
  {
    icon: "🎤",
    title: "Speaking 11 câu",
    text: "Nói qua micro, đếm giờ như phòng thi. AI chấm theo tiêu chí ETS, sửa lỗi và đưa bài mẫu.",
    href: "/speaking",
    cta: "Luyện Speaking",
  },
  {
    icon: "🎧",
    title: "Chấm phát âm",
    text: "AI nghe chính giọng bạn, chỉ ra từ đọc sai, phiên âm IPA và cách sửa, tập trung lỗi người Việt hay mắc.",
    href: "/practice/read-aloud",
    cta: "Thử đọc to",
  },
  {
    icon: "✍️",
    title: "Writing 8 câu",
    text: "Xem cấu trúc và bài mẫu trước khi viết, rồi được chấm điểm từng tiêu chí, sửa lỗi và nâng cấp bài.",
    href: "/writing",
    cta: "Luyện Writing",
  },
  {
    icon: "💡",
    title: "Mẹo thi & mẫu câu",
    text: "Chiến lược từng dạng câu hỏi, mẫu câu ghi điểm và cách phân bổ thời gian trong phòng thi.",
    href: "/tips",
    cta: "Xem mẹo thi",
  },
];

const STEPS = [
  { n: "1", title: "Chọn dạng câu hỏi", text: "Mỗi dạng bài bám sát cấu trúc đề thi ETS hiện hành." },
  { n: "2", title: "Học cấu trúc rồi làm bài", text: "Xem dàn ý, mẫu câu, bài mẫu; sau đó nói hoặc viết có tính giờ." },
  { n: "3", title: "Nhận chấm điểm tức thì", text: "Điểm theo rubric, lỗi được sửa, bài nâng cấp và mẹo cho lần sau." },
];

const FORMAT = [
  { part: "Speaking", detail: "11 câu · khoảng 20 phút", items: ["Read aloud", "Describe a picture", "Respond to questions", "Respond using information", "Express an opinion"] },
  { part: "Writing", detail: "8 câu · khoảng 60 phút", items: ["Sentence based on a picture", "Respond to a written request", "Opinion essay"] },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--primary-soft),transparent)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="chip">Luyện thi TOEIC Speaking & Writing</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Giám khảo AI giúp bạn <span className="text-primary">nói và viết</span> tự tin hơn mỗi ngày
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Luyện đúng 19 câu của đề thi thật, nhận chấm điểm theo tiêu chí ETS, chấm phát âm từ giọng nói và bài mẫu
              ngay sau mỗi lần làm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/speaking" className="btn-primary">
                Bắt đầu luyện Speaking
              </Link>
              <Link href="/writing" className="btn-secondary">
                Luyện Writing
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">Miễn phí · Không cần đăng ký · Dùng tốt nhất trên Chrome/Edge</p>
          </div>

          <div className="card p-5 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Question 11 · Express an opinion</span>
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
                ● 0:42
              </span>
            </div>
            <p className="mt-3 rounded-xl bg-surface-2 p-3 text-sm">
              Do you agree that employees should be allowed to work from home? Give specific reasons or examples.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["4/5", "Điểm câu"],
                ["82", "Phát âm"],
                ["3", "Lỗi đã sửa"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border border-border p-3">
                  <p className="text-xl font-bold text-primary">{v}</p>
                  <p className="text-xs text-muted">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">
              <del className="text-red-600 dark:text-red-400">I am agree</del> →{" "}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">I agree</span>
            </p>
            <p className="mt-1 text-xs text-muted">Ví dụ minh hoạ kết quả chấm</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Mọi thứ bạn cần cho phần thi nói và viết</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} className="card group flex flex-col p-5 transition hover:border-primary">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{f.text}</p>
              <span className="mt-4 text-sm font-semibold text-primary">{f.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cách luyện tập</h2>
            <ol className="mt-8 space-y-6">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="mt-1 text-sm text-muted">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Cấu trúc đề thi</h2>
            <div className="mt-8 space-y-4">
              {FORMAT.map((f) => (
                <div key={f.part} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="font-semibold">{f.part}</p>
                    <p className="text-sm text-muted">{f.detail}</p>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {f.items.map((i) => (
                      <li key={i} className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-sm text-muted">Mỗi kỹ năng chấm trên thang 0–200 điểm.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="card flex flex-col items-start gap-4 bg-primary-soft p-8 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h2 className="text-xl font-bold">Chưa biết bắt đầu từ đâu?</h2>
            <p className="mt-1 text-muted">Đọc mẹo thi và mẫu câu trước, sau đó luyện từng phần trong 15 phút mỗi ngày.</p>
          </div>
          <Link href="/tips" className="btn-primary">
            Xem mẹo thi TOEIC
          </Link>
        </div>
      </section>
    </>
  );
}
