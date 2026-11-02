import { notFound } from "next/navigation";
import { Suspense } from "react";
import PracticeChat from "@/components/PracticeChat";
import { getMode, MODES } from "@/lib/toeic";

export function generateStaticParams() {
  return MODES.map((m) => ({ mode: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/practice/[mode]">) {
  const mode = getMode((await params).mode);
  return { title: mode ? `${mode.title} · TOEIC Speaking` : "TOEIC Speaking" };
}

export default function PracticePage({ params }: PageProps<"/practice/[mode]">) {
  // params is URL data, so it is read behind Suspense to keep the shared App Shell instant.
  return (
    <Suspense fallback={<p className="p-6 text-sm text-muted">Đang tải…</p>}>
      <Practice params={params} />
    </Suspense>
  );
}

async function Practice({ params }: Pick<PageProps<"/practice/[mode]">, "params">) {
  const mode = getMode((await params).mode);
  if (!mode) notFound();
  // key: a fresh session whenever the learner switches mode.
  return <PracticeChat key={mode.id} mode={mode} />;
}
