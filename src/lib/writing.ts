// TOEIC Writing tasks (ETS format, 8 questions) with the study material shown before writing.

export type WritingTaskId = "picture-sentence" | "email-response" | "opinion-essay";

export interface StructureStep {
  title: string;
  detail: string;
  example?: string;
}

export interface PhraseGroup {
  label: string;
  phrases: string[];
}

export interface WritingTask {
  id: WritingTaskId;
  title: string;
  questions: string;
  description: string;
  /** Suggested minutes for one question in this app. */
  minutes: number;
  maxScore: number;
  minWords?: number;
  rubric: string[];
  structure: StructureStep[];
  phrases: PhraseGroup[];
  sample: { prompt: string; answer: string; note: string };
  tips: string[];
}

export const WRITING_TASKS: WritingTask[] = [
  {
    id: "picture-sentence",
    title: "Write a sentence based on a picture",
    questions: "Câu 1–5",
    description: "Viết một câu mô tả bức ảnh, bắt buộc dùng đúng hai từ cho sẵn.",
    minutes: 2,
    maxScore: 3,
    rubric: ["Dùng đủ cả hai từ (đúng dạng từ được phép biến đổi)", "Ngữ pháp đúng", "Câu liên quan tới bức ảnh"],
    structure: [
      {
        title: "1. Xác định loại từ",
        detail: "Xem hai từ là danh từ, động từ, giới từ hay liên từ. Động từ có thể chia thì; danh từ có thể thêm -s.",
        example: "woman / hold → 'hold' là động từ, cần chia: is holding",
      },
      {
        title: "2. Chọn mẫu câu đơn giản",
        detail: "Câu ngắn, đúng ngữ pháp được điểm tối đa. Không cần câu dài hay từ khó.",
        example: "S + is/are + V-ing + O + giới từ + nơi chốn",
      },
      {
        title: "3. Ghép từ theo đúng thứ tự logic",
        detail: "Hai từ có thể dùng theo thứ tự bất kỳ, nhưng cả câu phải mô tả đúng ảnh.",
        example: "because / tired → The man is resting because he is tired.",
      },
      {
        title: "4. Soát lỗi 10 giây",
        detail: "Kiểm tra mạo từ a/an/the, số ít/số nhiều, chia động từ, dấu chấm cuối câu.",
      },
    ],
    phrases: [
      { label: "Mẫu câu hiện tại tiếp diễn", phrases: ["A woman is ___ing ___ in the ___.", "Two people are ___ing while ___."] },
      { label: "Giới từ vị trí", phrases: ["next to", "in front of", "behind", "on top of", "across from", "between ... and ..."] },
      { label: "Liên từ hay gặp", phrases: ["because", "so", "while", "and", "before / after", "so that"] },
      { label: "Bị động", phrases: ["Some boxes are stacked on the floor.", "The table is covered with papers."] },
    ],
    sample: {
      prompt: "Ảnh: một người đàn ông đang đọc báo trong quán cà phê.\nTừ cho sẵn: man / newspaper",
      answer: "A man is reading a newspaper while he waits for his coffee.",
      note: "Dùng đủ hai từ, đúng thì hiện tại tiếp diễn, có thêm mệnh đề 'while' cho câu tự nhiên nhưng vẫn ngắn gọn.",
    },
    tips: [
      "Ưu tiên đúng hơn hay: một câu 8–12 từ chuẩn ngữ pháp là đủ 3 điểm.",
      "Không được đổi từ loại của từ cho sẵn (ví dụ 'happy' không thành 'happiness').",
      "Thi thật có 8 phút cho 5 câu: làm câu dễ trước, chừa 1 phút soát lỗi.",
    ],
  },
  {
    id: "email-response",
    title: "Respond to a written request",
    questions: "Câu 6–7",
    description: "Đọc một email và viết thư trả lời, hoàn thành đủ các yêu cầu được giao.",
    minutes: 10,
    maxScore: 4,
    minWords: 120,
    rubric: [
      "Hoàn thành đủ mọi yêu cầu trong đề (ví dụ: 2 câu hỏi + 1 gợi ý)",
      "Bố cục thư rõ ràng, giọng văn phù hợp",
      "Câu văn đa dạng, ít lỗi ngữ pháp và từ vựng",
    ],
    structure: [
      { title: "1. Lời chào", detail: "Gọi đúng tên người gửi.", example: "Dear Ms. Johnson," },
      {
        title: "2. Câu mở đầu",
        detail: "Cảm ơn và nêu mục đích thư trong 1–2 câu.",
        example: "Thank you for your email about the upcoming training workshop. I am writing to ...",
      },
      {
        title: "3. Thân thư: từng yêu cầu một",
        detail: "Mỗi yêu cầu là một đoạn ngắn, bắt đầu bằng từ nối để giám khảo dễ thấy bạn làm đủ.",
        example: "First, I would like to know ... Second, could you tell me ... Finally, I suggest that ...",
      },
      {
        title: "4. Câu kết",
        detail: "Đề nghị liên lạc tiếp hoặc cảm ơn lần nữa.",
        example: "Please let me know if you need any further information. I look forward to hearing from you.",
      },
      { title: "5. Ký tên", detail: "Lời chào cuối + tên.", example: "Best regards,\nMinh Nguyen" },
    ],
    phrases: [
      { label: "Đặt câu hỏi lịch sự", phrases: ["Could you please let me know ...?", "I was wondering whether ...", "Would it be possible to ...?"] },
      { label: "Đưa ra gợi ý", phrases: ["I would suggest that ...", "It might be a good idea to ...", "One option would be to ..."] },
      { label: "Cung cấp thông tin", phrases: ["I would like to inform you that ...", "As requested, I have attached ...", "Regarding your question about ..., ..."] },
      { label: "Từ nối", phrases: ["First / Second / Finally", "In addition", "However", "As a result"] },
    ],
    sample: {
      prompt:
        "From: Linda Park, Office Manager\nSubject: New coffee machine\n\nWe are planning to buy a new coffee machine for the break room. Please reply with ONE problem with the current machine and TWO features you would like the new one to have.",
      answer:
        "Dear Ms. Park,\n\nThank you for asking for our opinions about the new coffee machine.\n\nThe main problem with the current machine is that it often breaks down in the morning, so many of us have to buy coffee outside before meetings.\n\nAs for the new machine, I would like it to have two features. First, it should be able to make several drinks at once, because the break room is very crowded at 9 a.m. Second, it would be great if it offered tea and hot chocolate for colleagues who do not drink coffee.\n\nPlease let me know if you need any more suggestions.\n\nBest regards,\nMinh Nguyen",
      note: "Làm đủ 1 vấn đề + 2 tính năng, đánh dấu rõ bằng 'First', 'Second'. Mỗi ý có lý do cụ thể.",
    },
    tips: [
      "Gạch chân số lượng yêu cầu trong đề (ONE problem, TWO features). Thiếu một yêu cầu là mất điểm nặng nhất.",
      "Viết khoảng 120–150 từ là đủ; dài hơn không được cộng điểm nhưng dễ sai hơn.",
      "Dành 1 phút đầu lập dàn ý, 1 phút cuối soát lỗi chính tả và mạo từ.",
    ],
  },
  {
    id: "opinion-essay",
    title: "Write an opinion essay",
    questions: "Câu 8",
    description: "Viết bài luận nêu quan điểm, có lý do và ví dụ cụ thể (tối thiểu 300 từ).",
    minutes: 30,
    maxScore: 5,
    minWords: 300,
    rubric: [
      "Quan điểm rõ ràng, trả lời đúng câu hỏi",
      "Lý do và ví dụ cụ thể, phát triển đầy đủ",
      "Bố cục mạch lạc, có từ nối",
      "Ngữ pháp và từ vựng đa dạng, chính xác",
    ],
    structure: [
      {
        title: "1. Mở bài (2–3 câu)",
        detail: "Diễn đạt lại đề + nêu rõ quan điểm + giới thiệu 2 lý do.",
        example: "Some people believe that ... In my opinion, ... for two main reasons: ... and ...",
      },
      {
        title: "2. Thân bài 1: Lý do 1",
        detail: "Câu chủ đề → giải thích → ví dụ cụ thể (trải nghiệm bản thân, số liệu, tình huống) → câu kết đoạn.",
        example: "First of all, ... For example, when I worked at ..., ... This shows that ...",
      },
      {
        title: "3. Thân bài 2: Lý do 2",
        detail: "Cùng cấu trúc với đoạn 1, dùng từ nối khác.",
        example: "Another reason is that ... For instance, ... Therefore, ...",
      },
      {
        title: "4. (Tuỳ chọn) Phản biện",
        detail: "Nhắc ngắn quan điểm ngược lại rồi bác bỏ, giúp bài thuyết phục hơn.",
        example: "Admittedly, ... However, ...",
      },
      {
        title: "5. Kết bài (2–3 câu)",
        detail: "Nhắc lại quan điểm bằng cách diễn đạt khác + tóm tắt hai lý do.",
        example: "In conclusion, I firmly believe that ... because ... and ...",
      },
    ],
    phrases: [
      { label: "Nêu quan điểm", phrases: ["In my opinion, ...", "I strongly believe that ...", "From my point of view, ..."] },
      { label: "Đưa ví dụ", phrases: ["For example, ...", "For instance, ...", "A good example of this is ...", "Take ... as an example."] },
      { label: "Bổ sung, đối lập", phrases: ["Furthermore, ...", "In addition, ...", "On the other hand, ...", "Admittedly, ... However, ..."] },
      { label: "Kết luận", phrases: ["In conclusion, ...", "To sum up, ...", "For these reasons, ..."] },
    ],
    sample: {
      prompt:
        "Do you agree or disagree with the following statement? It is better for employees to work from home than at the office. Use specific reasons and examples to support your opinion.",
      answer:
        "Many companies now allow their staff to work remotely, and some people think that working from home is always the better choice. In my opinion, however, employees are generally more effective at the office, for two main reasons: teamwork and a clear separation between work and private life.\n\nFirst of all, working at the office makes teamwork much easier. When colleagues sit in the same room, they can solve problems in a few minutes instead of waiting for replies to emails or messages. For example, at my previous company, our marketing team once had to change a whole campaign in one afternoon. Because everyone was in the office, we discussed the new plan face to face, divided the tasks quickly and finished on time. If we had been working from home, the same work would probably have taken two or three days.\n\nAnother reason is that the office helps people keep work and private life separate. At home, there are many distractions, such as housework, children or the television, and it is easy to keep working late into the evening. In contrast, going to the office gives the day a clear structure. My friend, who worked from home for a year, told me that he often answered emails at midnight and felt tired all the time. After he returned to the office, he felt more focused during the day and more relaxed in the evening.\n\nAdmittedly, working from home saves commuting time and can be convenient for some tasks. However, these benefits do not outweigh the value of direct communication and a healthy routine.\n\nIn conclusion, I firmly believe that employees perform better at the office, because it supports teamwork and protects their personal time. Companies may offer some flexibility, but the office should remain the main place of work.",
      note: "Bố cục 5 đoạn, mỗi lý do có ví dụ cụ thể từ trải nghiệm, dùng từ nối rõ ràng, khoảng 330 từ.",
    },
    tips: [
      "Chọn phe dễ tìm ví dụ hơn, không cần là quan điểm thật của bạn.",
      "Phân bổ 30 phút: 4 phút dàn ý, 22 phút viết, 4 phút soát lỗi.",
      "Ví dụ cá nhân cụ thể (tên công ty, thời gian, kết quả) được điểm cao hơn ví dụ chung chung.",
      "Dưới 300 từ rất khó đạt 4–5 điểm.",
    ],
  },
];

export function getWritingTask(id: string): WritingTask | undefined {
  return WRITING_TASKS.find((t) => t.id === id);
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** The task the learner must answer, generated by the AI. */
export interface WritingPrompt {
  /** Instructions shown above the answer box, in English as on the test. */
  directions: string;
  /** Email to answer, or essay question. Empty for picture tasks. */
  content: string;
  /** The two required words, for picture tasks. */
  words: string[];
}

export interface WritingCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingReport {
  score: number;
  maxScore: number;
  /** Rough TOEIC Writing scaled score (0–200) this level of answer suggests. */
  scaledEstimate: number;
  summary: string;
  criteria: { name: string; score: number; comment: string }[];
  corrections: WritingCorrection[];
  improvedAnswer: string;
  tips: string[];
}
