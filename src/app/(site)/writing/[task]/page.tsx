import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import WritingPractice from "@/components/WritingPractice";
import { getWritingTask, WRITING_TASKS } from "@/lib/writing";

export function generateStaticParams() {
  return WRITING_TASKS.map((t) => ({ task: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/writing/[task]">) {
  const task = getWritingTask((await params).task);
  return { title: task ? `${task.title} (${task.questions})` : "Luyện Writing" };
}

export default function WritingTaskPage({ params }: PageProps<"/writing/[task]">) {
  // params is URL data, so it is read behind Suspense to keep the shared App Shell instant.
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/writing" className="text-sm text-muted hover:text-foreground">
        ← Tất cả dạng Writing
      </Link>
      <Suspense fallback={<p className="mt-6 text-sm text-muted">Đang tải…</p>}>
        <Task params={params} />
      </Suspense>
    </div>
  );
}

async function Task({ params }: Pick<PageProps<"/writing/[task]">, "params">) {
  const task = getWritingTask((await params).task);
  if (!task) notFound();
  return (
    <>
      <div className="mb-6 mt-3">
        <span className="chip">{task.questions}</span>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">{task.title}</h1>
        <p className="mt-1 text-muted">{task.description}</p>
      </div>
      <WritingPractice key={task.id} task={task} />
    </>
  );
}
