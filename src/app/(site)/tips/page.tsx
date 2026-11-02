import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mẹo thi TOEIC Speaking & Writing",
  description: "Chiến lược từng dạng câu hỏi, mẫu câu ghi điểm, lỗi người Việt hay mắc và kế hoạch ngày thi TOEIC.",
};

const SECTIONS = [
  { id: "overview", label: "Tổng quan đề thi" },
  { id: "speaking", label: "Mẹo Speaking" },
  { id: "writing", label: "Mẹo Writing" },
  { id: "templates", label: "Mẫu câu ghi điểm" },
  { id: "mistakes", label: "Lỗi người Việt hay mắc" },
  { id: "exam-day", label: "Ngày thi" },
];

const SPEAKING_TIPS = [
  {
    part: "Câu 1–2 · Read a text aloud",
    time: "Chuẩn bị 45s · Đọc 45s",
    tips: [
      "Dùng 45 giây chuẩn bị để đọc nhẩm thành tiếng, đánh dấu chỗ ngắt sau dấu phẩy và trước từ nối.",
      "Danh sách 3 thứ: lên giọng ở 2 thứ đầu, xuống giọng ở thứ cuối (coats ↗, boots ↗, and bags ↘).",
      "Câu hỏi Yes/No lên giọng cuối câu; câu hỏi Wh- xuống giọng.",
      "Đọc chậm, rõ âm cuối hơn là đọc nhanh. Đọc sai một từ thì cứ tiếp tục, đừng đọc lại cả câu.",
    ],
  },
  {
    part: "Câu 3–4 · Describe a picture",
    time: "Chuẩn bị 45s · Nói 30s",
    tips: [
      "Theo thứ tự: bối cảnh → nhân vật/vật chính → hành động → chi tiết xung quanh → cảm nhận.",
      "Dùng hiện tại tiếp diễn cho hành động (is talking, are walking) và There is/are cho vật.",
      "Dùng giới từ vị trí để kéo dài câu: in the foreground, in the background, on the left.",
      "Không biết từ thì mô tả vòng: 'a machine for making coffee' thay cho từ chuyên ngành.",
    ],
  },
  {
    part: "Câu 5–7 · Respond to questions",
    time: "Chuẩn bị 3s · Nói 15s / 15s / 30s",
    tips: [
      "Lặp lại một phần câu hỏi để có thời gian nghĩ: 'I usually go shopping about twice a month...'.",
      "Câu 5–6: trả lời đủ cả hai ý được hỏi, thêm một lý do ngắn.",
      "Câu 7 (30s): Quan điểm → lý do 1 + ví dụ → lý do 2 → câu kết.",
    ],
  },
  {
    part: "Câu 8–10 · Respond using information",
    time: "Đọc 45s · Nói 15s / 15s / 30s",
    tips: [
      "Trong 45 giây đọc, xác định loại tài liệu và chú ý giờ, ngày, địa điểm, giá, ghi chú đặc biệt (cancelled, moved).",
      "Câu 9 thường chứa thông tin sai: sửa lịch sự 'Actually, I'm afraid that's not correct. The session is at...'.",
      "Câu 10 hỏi nhiều mục: liệt kê theo thứ tự thời gian với 'First... After that... Finally...'.",
    ],
  },
  {
    part: "Câu 11 · Express an opinion",
    time: "Chuẩn bị 45s · Nói 60s",
    tips: [
      "Chọn phe ngay trong 5 giây đầu, dùng 40 giây còn lại nghĩ 2 lý do và 1 ví dụ cá nhân.",
      "Bố cục: quan điểm (5s) → lý do 1 + ví dụ (20s) → lý do 2 + ví dụ (20s) → kết luận (10s).",
      "Nói tới khi hết giờ, nhưng đừng bắt đầu ý mới ở 5 giây cuối.",
    ],
  },
];

const WRITING_TIPS = [
  {
    part: "Câu 1–5 · Sentence based on a picture",
    time: "8 phút cho 5 câu",
    tips: [
      "Một câu ngắn đúng ngữ pháp là đủ 3 điểm, không cần câu phức.",
      "Được đổi dạng từ (thì, số nhiều) nhưng không được đổi từ loại.",
      "Làm câu dễ trước, chừa 1 phút soát mạo từ và chia động từ.",
    ],
  },
  {
    part: "Câu 6–7 · Respond to a written request",
    time: "10 phút mỗi câu",
    tips: [
      "Đếm và gạch chân yêu cầu (ask TWO questions, make ONE suggestion). Thiếu yêu cầu là lỗi nặng nhất.",
      "Mỗi yêu cầu một đoạn, mở bằng First / Second / Finally để giám khảo thấy rõ.",
      "Giữ giọng văn lịch sự, có lời chào và ký tên.",
    ],
  },
  {
    part: "Câu 8 · Opinion essay",
    time: "30 phút · tối thiểu 300 từ",
    tips: [
      "Phân bổ: 4 phút dàn ý, 22 phút viết, 4 phút soát lỗi.",
      "Bố cục 4–5 đoạn: mở bài, 2 đoạn lý do có ví dụ, (phản biện), kết bài.",
      "Ví dụ cụ thể (công ty, thời gian, con số) thuyết phục hơn ví dụ chung chung.",
    ],
  },
];

const TEMPLATES = [
  {
    label: "Bắt đầu câu trả lời",
    items: ["Personally, I think that...", "That's a good question. In my case, ...", "To be honest, I would say that..."],
  },
  {
    label: "Đưa lý do và ví dụ",
    items: ["The main reason is that...", "For example, when I was...", "Another reason is that..."],
  },
  {
    label: "Mô tả tranh",
    items: ["This picture was taken in/at...", "In the foreground, I can see...", "It looks like they are..."],
  },
  {
    label: "Sửa thông tin (câu 9)",
    items: ["Actually, I'm afraid there has been a change.", "According to the schedule, ...", "So you don't need to worry about..."],
  },
  {
    label: "Kết luận",
    items: ["That's why I believe that...", "For these reasons, ...", "Overall, I would prefer..."],
  },
  {
    label: "Câu đệm khi cần nghĩ",
    items: ["Let me think...", "Well, it depends, but...", "What I mean is..."],
  },
];

const MISTAKES = [
  ["Nuốt âm cuối", "work → wor, likes → like", "Bật rõ /t/ /k/ /s/ cuối từ, nhất là khi từ sau bắt đầu bằng phụ âm."],
  ["Thiếu -s, -ed", "He go to work, I visit Hanoi last year", "Soát chủ ngữ số ít và mốc thời gian quá khứ trước khi nói/viết."],
  ["Âm /θ/ /ð/", "think → tink, this → dis", "Đặt đầu lưỡi giữa hai hàm răng và thổi hơi."],
  ["Sai trọng âm", "hoTEL, deVElop, PHOtograph", "Học từ kèm trọng âm; tra từ điển và nghe lại bằng nút 🔊."],
  ["Dùng 'be' thừa", "I am agree, I am work", "agree, work là động từ thường, không cần 'am'."],
  ["Quên mạo từ", "I have meeting at office", "Danh từ đếm được số ít cần a/an/the: a meeting at the office."],
];

export default function TipsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="chip">Cẩm nang</span>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Mẹo thi TOEIC Speaking & Writing</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Chiến lược cho từng dạng câu hỏi, mẫu câu dùng được ngay và những lỗi người Việt hay mắc nhất. Đọc xong, hãy luyện
        ngay để nhớ lâu.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav className="h-fit text-sm lg:sticky lg:top-24" aria-label="Mục lục">
          <p className="mb-2 font-semibold">Mục lục</p>
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-muted hover:bg-surface-2 hover:text-foreground">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          <section id="overview" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Tổng quan đề thi</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="py-2 pr-4 font-medium">Kỹ năng</th>
                    <th className="py-2 pr-4 font-medium">Số câu</th>
                    <th className="py-2 pr-4 font-medium">Thời gian</th>
                    <th className="py-2 font-medium">Thang điểm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold">Speaking</td>
                    <td className="py-2 pr-4">11 câu, 5 dạng</td>
                    <td className="py-2 pr-4">~20 phút</td>
                    <td className="py-2">0–200</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 pr-4 font-semibold">Writing</td>
                    <td className="py-2 pr-4">8 câu, 3 dạng</td>
                    <td className="py-2 pr-4">~60 phút</td>
                    <td className="py-2">0–200</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-muted">
              Mỗi câu được chấm theo thang 0–3, 0–4 hoặc 0–5 tuỳ dạng, sau đó quy đổi sang thang 200. Cấu trúc đề có thể
              thay đổi theo từng thời kỳ; hãy kiểm tra thông tin mới nhất trên trang của IIG/ETS trước khi thi.
            </p>
          </section>

          <section id="speaking" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Mẹo Speaking</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {SPEAKING_TIPS.map((t) => (
                <TipCard key={t.part} {...t} />
              ))}
            </div>
            <Link href="/speaking" className="btn-primary mt-5">
              Luyện Speaking ngay
            </Link>
          </section>

          <section id="writing" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Mẹo Writing</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {WRITING_TIPS.map((t) => (
                <TipCard key={t.part} {...t} />
              ))}
            </div>
            <Link href="/writing" className="btn-primary mt-5">
              Luyện Writing ngay
            </Link>
          </section>

          <section id="templates" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Mẫu câu ghi điểm</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((g) => (
                <div key={g.label} className="card p-5">
                  <p className="font-semibold">{g.label}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {g.items.map((i) => (
                      <li key={i} className="rounded-lg bg-primary-soft px-3 py-2 font-medium text-primary">
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section id="mistakes" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Lỗi người Việt hay mắc</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
              {MISTAKES.map(([title, example, fix]) => (
                <div key={title} className="grid gap-1 p-4 text-sm sm:grid-cols-[10rem_1fr_1.4fr] sm:gap-4">
                  <p className="font-semibold">{title}</p>
                  <p className="text-red-600 dark:text-red-400">{example}</p>
                  <p className="text-muted">{fix}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="exam-day" className="scroll-mt-24">
            <h2 className="text-2xl font-bold">Ngày thi</h2>
            <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Trước 1 tuần", "Mỗi ngày làm một đề đầy đủ có tính giờ để quen áp lực thời gian."],
                ["Tối hôm trước", "Ôn lại mẫu câu, ngủ đủ giấc. Không học thêm dạng bài mới."],
                ["Trong phòng thi", "Kiểm tra micro và tai nghe khi được hướng dẫn. Nói đủ to, không cần nói to quá."],
                ["Khi bí ý", "Dùng câu đệm, nói một ví dụ đơn giản. Im lặng là mất điểm nhiều nhất."],
              ].map(([title, text]) => (
                <li key={title} className="rounded-2xl bg-surface-2 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function TipCard({ part, time, tips }: { part: string; time: string; tips: string[] }) {
  return (
    <div className="card p-5">
      <p className="font-semibold">{part}</p>
      <p className="mt-0.5 text-xs text-muted">{time}</p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm">
        {tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
