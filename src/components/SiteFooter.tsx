import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
        <div>
          <p className="font-bold">
            TOEIC <span className="text-primary">Coach</span>
          </p>
          <p className="mt-2 text-muted">
            Luyện TOEIC Speaking & Writing với giám khảo AI. Điểm số chỉ mang tính tham khảo, không thay thế điểm thi chính
            thức của ETS.
          </p>
        </div>
        <div>
          <p className="font-semibold">Luyện tập</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li>
              <Link href="/speaking" className="hover:text-foreground">
                Speaking (11 câu)
              </Link>
            </li>
            <li>
              <Link href="/writing" className="hover:text-foreground">
                Writing (8 câu)
              </Link>
            </li>
            <li>
              <Link href="/practice/free-talk" className="hover:text-foreground">
                Trò chuyện tự do
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Tài liệu</p>
          <ul className="mt-2 space-y-1.5 text-muted">
            <li>
              <Link href="/tips" className="hover:text-foreground">
                Mẹo thi TOEIC
              </Link>
            </li>
            <li>
              <Link href="/tips#templates" className="hover:text-foreground">
                Mẫu câu ghi điểm
              </Link>
            </li>
            <li>
              <Link href="/tips#mistakes" className="hover:text-foreground">
                Lỗi người Việt hay mắc
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
