# TOEIC Speaking Coach

Website luyện nói tiếng Anh với AI (Google Gemini) để ôn thi TOEIC Speaking. Xây bằng Next.js (App Router) + Tailwind.

## Chạy thử

```bash
npm install
cp .env.example .env   # rồi điền GEMINI_API_KEY
npm run dev
```

Mở http://localhost:3000 bằng **Chrome hoặc Edge** (cần cho nhận diện giọng nói). Nên đeo tai nghe.

## Tính năng

- **Speaking (11 câu):** 5 dạng câu hỏi ETS và trò chuyện tự do. Nói qua micro, đếm giờ như thi thật, AI chấm theo rubric, sửa lỗi và đưa bài mẫu.
- **Chấm phát âm:** AI nghe file ghi âm, cho điểm độ chính xác, trôi chảy, ngữ điệu và liệt kê từ đọc sai kèm IPA.
- **Writing (8 câu):** xem cấu trúc, mẫu câu, bài mẫu trước khi viết; AI ra đề mới, chấm theo từng tiêu chí, sửa lỗi và viết lại bài.
- **Mẹo thi:** chiến lược từng dạng câu, mẫu câu ghi điểm, lỗi người Việt hay mắc.

## Cấu trúc

| File | Vai trò |
|---|---|
| `src/lib/toeic.ts` | Danh sách chế độ luyện tập, đọc thẻ hẹn giờ `[[TIMER ...]]` |
| `src/lib/prompts.ts` | System prompt cho giám khảo AI theo từng dạng câu hỏi |
| `src/app/api/chat/route.ts` | API stream câu trả lời từ Gemini |
| `src/app/api/pronunciation/route.ts` | Chấm phát âm từ file ghi âm |
| `src/app/api/writing/*` | Tạo đề và chấm bài Writing |
| `src/lib/writing.ts` | Nội dung cấu trúc, mẫu câu, bài mẫu Writing |
| `src/lib/gemini.ts` | Gọi Gemini, tự chuyển model dự phòng khi quá tải |
| `src/components/PracticeChat.tsx` | Giao diện chat, micro, đồng hồ |
| `src/hooks/useSpeech*.ts` | Nhận diện giọng nói và đọc văn bản |

## Cấu hình

- `GEMINI_MODEL`: mặc định `gemini-flash-latest`.
- `GEMINI_FALLBACK_MODEL`: mặc định `gemini-flash-lite-latest`, dùng khi model chính quá tải (503).

## Giới hạn

- AI chỉ nhận được bản chép lời (transcript), không nghe được âm thanh thật, nên phần chấm phát âm chỉ là ước lượng dựa trên những từ bị nhận diện sai.
- Firefox và Safari hỗ trợ nhận diện giọng nói hạn chế; khi đó vẫn có thể gõ câu trả lời.

## Deploy lên Vercel

1. Import repo trên https://vercel.com/new (framework Next.js được nhận diện tự động).
2. Thêm biến môi trường `GEMINI_API_KEY` trong Project Settings → Environment Variables.
3. Deploy. Mỗi lần push lên `main` sẽ tự deploy lại.
