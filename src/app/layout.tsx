import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

// Be Vietnam Pro renders Vietnamese diacritics cleanly, which most UI fonts do not.
const sans = Be_Vietnam_Pro({
  variable: "--font-sans-family",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const mono = Geist_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TOEIC Coach · Luyện Speaking & Writing cùng AI",
    template: "%s · TOEIC Coach",
  },
  description:
    "Luyện thi TOEIC Speaking và Writing với AI: chấm điểm theo tiêu chí ETS, chấm phát âm, sửa lỗi, bài mẫu và mẹo thi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
