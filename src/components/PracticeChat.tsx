"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { markdownToSpeech, useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { recordingToWavBase64 } from "@/lib/audio";
import { blobToChatImage, chatImageSrc, fetchRandomPhoto } from "@/lib/image";
import { parseTimer, stripTimer, type ModeId, type PracticeMode, type TaskTimer } from "@/lib/toeic";
import { ERROR_MARKER, type ChatImage, type ChatMessage, type PronunciationReport } from "@/lib/types";

type PronunciationState =
  | { status: "loading" }
  | { status: "done"; report: PronunciationReport }
  | { status: "error"; message: string };

interface UiMessage extends ChatMessage {
  id: string;
  hidden?: boolean;
  error?: string;
  pronunciation?: PronunciationState;
}

type Phase = { kind: "idle" } | { kind: "prep" | "speak"; remaining: number; total: number };

interface Settings {
  autoSpeak: boolean;
  examTimer: boolean;
  explainInVietnamese: boolean;
}

const DEFAULT_SETTINGS: Settings = { autoSpeak: true, examTimer: true, explainInVietnamese: true };
const SETTINGS_KEY = "toeic-speaking-settings";
const NO_ANSWER = "(no answer: the time ran out before I said anything)";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** The part of a reply worth reading aloud: the task (not Vietnamese feedback, not the passage to read). */
function speakableText(text: string, mode: ModeId): string {
  const clean = stripTimer(text);
  if (mode === "free-talk") {
    return markdownToSpeech(clean.split("\n").filter((l) => !l.trim().startsWith("💡")).join("\n"));
  }
  if (mode === "read-aloud") return "";
  const taskStart = clean.indexOf("### Task");
  return taskStart === -1 ? "" : markdownToSpeech(clean.slice(taskStart + "### Task".length));
}

/** The passage the learner was asked to read: the task in the latest examiner message. */
function readAloudReference(messages: UiMessage[]): string | undefined {
  const task = messages.findLast((m) => m.role === "assistant" && m.content.includes("### Task"));
  if (!task) return undefined;
  const clean = stripTimer(task.content);
  return markdownToSpeech(clean.slice(clean.indexOf("### Task") + "### Task".length)) || undefined;
}

let idCounter = 0;
const newId = () => `m${Date.now()}-${idCounter++}`;

export default function PracticeChat({ mode }: { mode: PracticeMode }) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [imageError, setImageError] = useState<string | null>(null);

  const recognition = useSpeechRecognition();
  const { start: startListening, stop: stopListening, reset: resetTranscript } = recognition;
  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();
  const { start: startAudio, stop: stopAudio } = useAudioRecorder();

  const messagesRef = useRef<UiMessage[]>([]);
  const settingsRef = useRef(settings);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<TaskTimer | null>(null);
  // What to do with the transcript once recognition has fully stopped.
  const afterStopRef = useRef<"send" | "fill" | null>(null);
  // Audio of the latest recording, waiting to be sent with the answer for pronunciation scoring.
  const pendingAudioRef = useRef<Promise<Blob | null> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateMessages = useCallback((next: UiMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const patchMessage = useCallback(
    (id: string, patch: Partial<UiMessage>) =>
      updateMessages(messagesRef.current.map((m) => (m.id === id ? { ...m, ...patch } : m))),
    [updateMessages],
  );

  const takePendingAudio = () => {
    const audio = pendingAudioRef.current;
    pendingAudioRef.current = null;
    return audio ?? undefined;
  };

  const assessPronunciation = useCallback(
    async (messageId: string, audio: Promise<Blob | null>, transcript: string, reference?: string) => {
      try {
        const blob = await audio;
        if (!blob) return patchMessage(messageId, { pronunciation: undefined });
        const res = await fetch("/api/pronunciation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: await recordingToWavBase64(blob),
            transcript,
            reference,
            explainInVietnamese: settingsRef.current.explainInVietnamese,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `Máy chủ trả về lỗi ${res.status}`);
        patchMessage(messageId, { pronunciation: { status: "done", report: data as PronunciationReport } });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Không chấm được phát âm.";
        patchMessage(messageId, { pronunciation: { status: "error", message } });
      }
    },
    [patchMessage],
  );

  useEffect(() => {
    // Read after hydration so the server-rendered checkboxes match the first client render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Storage unavailable (private mode); settings just won't persist.
    }
  }, [settings]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, recognition.transcript]);

  const startRecording = useCallback(() => {
    cancelSpeech();
    startListening();
    startAudio();
    const response = timerRef.current?.response;
    setPhase(response ? { kind: "speak", remaining: response, total: response } : { kind: "idle" });
  }, [cancelSpeech, startAudio, startListening]);

  const stopRecording = useCallback(
    (then: "send" | "fill") => {
      afterStopRef.current = then;
      setPhase({ kind: "idle" });
      stopListening();
      pendingAudioRef.current = stopAudio();
    },
    [stopAudio, stopListening],
  );

  const onReplyDone = useCallback(
    async (text: string) => {
      const timer = parseTimer(text);
      if (timer) timerRef.current = timer;
      if (settingsRef.current.autoSpeak) await speak(speakableText(text, mode.id));
      if (timer && settingsRef.current.examTimer) {
        if (timer.prep > 0) setPhase({ kind: "prep", remaining: timer.prep, total: timer.prep });
        else startRecording();
      }
    },
    [mode.id, speak, startRecording],
  );

  const send = useCallback(
    async (content: string, opts: { image?: ChatImage; hidden?: boolean; audio?: Promise<Blob | null> } = {}) => {
      if (abortRef.current) return;
      cancelSpeech();
      setPhase({ kind: "idle" });
      timerRef.current = null;

      const userMessage: UiMessage = { id: newId(), role: "user", content, image: opts.image, hidden: opts.hidden };
      if (opts.audio && content !== NO_ANSWER) {
        userMessage.pronunciation = { status: "loading" };
        const reference = mode.id === "read-aloud" ? readAloudReference(messagesRef.current) : undefined;
        // Runs alongside the examiner's reply; the report fills in when it is ready.
        void assessPronunciation(userMessage.id, opts.audio, content, reference);
      }
      const history = [...messagesRef.current, userMessage];
      const assistantId = newId();
      updateMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
      setInput("");
      resetTranscript();
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      let text = "";
      let error: string | undefined;
      const setReply = () =>
        updateMessages(
          messagesRef.current.map((m) => (m.id === assistantId ? { ...m, content: text, error } : m)),
        );

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            mode: mode.id,
            explainInVietnamese: settingsRef.current.explainInVietnamese,
            // Failed replies are left out so the model never sees error text as its own words.
            messages: history.filter((m) => !m.error).map(({ role, content, image }) => ({ role, content, image })),
          }),
        });
        if (!res.ok || !res.body) throw new Error(`Máy chủ trả về lỗi ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          const markerAt = text.indexOf(ERROR_MARKER);
          if (markerAt !== -1) {
            error = text.slice(markerAt + ERROR_MARKER.length);
            text = text.slice(0, markerAt);
          }
          setReply();
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        error = err instanceof Error ? err.message : "Không kết nối được tới máy chủ.";
        setReply();
      } finally {
        // A cancelled request must not clear the busy state of the request that replaced it.
        if (abortRef.current === controller) {
          abortRef.current = null;
          setBusy(false);
        }
      }

      if (!error) await onReplyDone(text);
    },
    [assessPronunciation, cancelSpeech, mode.id, onReplyDone, resetTranscript, updateMessages],
  );

  // Recognition finishes asynchronously; act on the transcript once the last words are in.
  useEffect(() => {
    if (recognition.listening || !afterStopRef.current) return;
    const action = afterStopRef.current;
    afterStopRef.current = null;
    const answer = [input.trim(), recognition.transcript.trim()].filter(Boolean).join(" ");
    if (action === "send") void send(answer || NO_ANSWER, { audio: takePendingAudio() });
    else setInput(answer);
  }, [input, recognition.listening, recognition.transcript, send]);

  // Countdown: prep time leads into recording, response time ends it.
  useEffect(() => {
    if (phase.kind === "idle") return;
    if (phase.remaining <= 0) {
      if (phase.kind === "prep") startRecording();
      else stopRecording(settingsRef.current.examTimer ? "send" : "fill");
      return;
    }
    const t = setTimeout(
      () => setPhase((p) => (p.kind === "idle" ? p : { ...p, remaining: p.remaining - 1 })),
      1000,
    );
    return () => clearTimeout(t);
  }, [phase, startRecording, stopRecording]);

  const sendPicture = useCallback(
    async (load: () => Promise<ChatImage>) => {
      setImageError(null);
      try {
        const image = await load();
        await send("Here is the picture. Please give me the task.", { image });
      } catch (err) {
        setImageError(err instanceof Error ? err.message : "Không đọc được ảnh.");
      }
    },
    [send],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cancelSpeech();
    afterStopRef.current = null;
    stopListening();
    void stopAudio();
    pendingAudioRef.current = null;
    setPhase({ kind: "idle" });
    timerRef.current = null;
    setBusy(false);
    updateMessages([]);
    setInput("");
  }, [cancelSpeech, stopAudio, stopListening, updateMessages]);

  /** Stops waiting for the current reply so the learner is never locked out. */
  const cancel = useCallback(() => {
    if (!abortRef.current) return;
    abortRef.current.abort();
    abortRef.current = null;
    setBusy(false);
    const last = messagesRef.current.at(-1);
    if (last?.role === "assistant") {
      updateMessages([
        ...messagesRef.current.slice(0, -1),
        { ...last, error: "Đã huỷ. Bấm \"Bắt đầu lại\" hoặc gửi lại câu trả lời." },
      ]);
    }
  }, [updateMessages]);

  const begin = useCallback(() => {
    if (!mode.needsImage) void send("Let's start.", { hidden: true });
  }, [mode.needsImage, send]);

  // Runs once per mount; the cleanup also keeps React Strict Mode's double mount from leaking a request.
  useEffect(() => {
    begin();
    return reset;
  }, [begin, reset]);

  const visible = messages.filter((m) => !m.hidden);
  const canType = !busy && !recognition.listening;
  // While recording, "Gửi" stops the microphone and sends what was said.
  const canSend = !busy && (recognition.listening || input.trim() !== "");
  const submit = () => {
    if (!canSend) return;
    if (recognition.listening) stopRecording("send");
    else void send(input.trim(), { audio: takePendingAudio() });
  };

  return (
    // Fills the viewport below the 4rem site header.
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3">
        <Link href="/speaking" className="text-sm text-muted hover:text-foreground">
          ← Speaking
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{mode.title}</h1>
          <p className="text-xs text-muted">
            {mode.questions} · {mode.timing}
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            begin();
          }}
          className="btn-ghost text-sm">
          Bắt đầu lại
        </button>
      </header>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-b border-border px-4 py-2 text-sm text-muted">
        <Toggle label="Đọc to đề bài" checked={settings.autoSpeak} onChange={(v) => setSettings({ ...settings, autoSpeak: v })} />
        {mode.id !== "free-talk" && (
          <Toggle label="Tính giờ như thi thật" checked={settings.examTimer} onChange={(v) => setSettings({ ...settings, examTimer: v })} />
        )}
        <Toggle
          label="Giải thích bằng tiếng Việt"
          checked={settings.explainInVietnamese}
          onChange={(v) => setSettings({ ...settings, explainInVietnamese: v })}
        />
      </div>

      <main className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {!recognition.supported && (
          <Notice>
            Trình duyệt này không hỗ trợ nhận diện giọng nói. Hãy dùng Chrome hoặc Edge trên máy tính để luyện nói; bạn vẫn có
            thể gõ câu trả lời.
          </Notice>
        )}
        {mode.needsImage && visible.length === 0 && (
          <Notice>Chọn một bức ảnh để bắt đầu. Ảnh có người đang làm gì đó sẽ giống đề thi thật nhất.</Notice>
        )}

        {visible.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onSpeak={() => speak(markdownToSpeech(stripTimer(m.content)))}
            onSpeakWord={(word) => speak(word, 0.7)}
          />
        ))}
        {busy && messages.at(-1)?.content === "" && (
          <p className="flex items-center gap-3 text-sm text-muted">
            AI đang soạn câu trả lời…
            <button onClick={cancel} className="btn-ghost text-xs">
              Huỷ
            </button>
          </p>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="space-y-3 border-t border-border px-4 py-3">
        {phase.kind !== "idle" && <Countdown phase={phase} onSkip={startRecording} />}
        {recognition.error && <p className="text-sm text-red-600 dark:text-red-400">{recognition.error}</p>}
        {imageError && <p className="text-sm text-red-600 dark:text-red-400">{imageError}</p>}

        {mode.needsImage && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost text-sm" disabled={!canType} onClick={() => fileInputRef.current?.click()}>
              📷 Tải ảnh lên
            </button>
            <button className="btn-ghost text-sm" disabled={!canType} onClick={() => sendPicture(fetchRandomPhoto)}>
              🎲 Ảnh mới (ngẫu nhiên)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void sendPicture(() => blobToChatImage(file));
              }}
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => (recognition.listening ? stopRecording("fill") : startRecording())}
            disabled={!recognition.supported || busy}
            aria-label={recognition.listening ? "Dừng ghi âm" : "Bắt đầu nói"}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl text-white transition disabled:opacity-40 ${
              recognition.listening ? "animate-pulse bg-red-600" : "bg-accent hover:opacity-90"
            }`}
          >
            {recognition.listening ? "■" : "🎤"}
          </button>
          <textarea
            value={recognition.listening ? recognition.transcript : input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            readOnly={recognition.listening}
            rows={2}
            placeholder={
              recognition.listening ? "Đang nghe… bấm Gửi khi nói xong" : "Bấm 🎤 để nói, hoặc gõ câu trả lời (Enter để gửi)"
            }
            className="min-h-12 flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-[15px] outline-none focus:border-accent"
          />
          <button
            onClick={submit}
            disabled={!canSend}
            className="h-12 shrink-0 rounded-xl bg-accent px-4 font-medium text-white disabled:opacity-40"
          >
            Gửi
          </button>
        </div>
      </footer>
    </div>
  );
}

function MessageBubble({
  message,
  onSpeak,
  onSpeakWord,
}: {
  message: UiMessage;
  onSpeak: () => void;
  onSpeakWord: (word: string) => void;
}) {
  const isUser = message.role === "user";
  const text = stripTimer(message.content);
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-4 py-3 ${
          isUser ? "bg-accent text-white" : "border border-border bg-surface"
        }`}
      >
        {message.image && (
          // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, nothing to optimise
          <img src={chatImageSrc(message.image)} alt="Ảnh cần mô tả" className="mb-2 max-h-80 rounded-lg" />
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        )}
        {message.error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">⚠️ {message.error}</p>}
        {!isUser && text && (
          <button onClick={onSpeak} className="mt-2 text-xs text-muted hover:text-foreground">
            🔊 Nghe
          </button>
        )}
      </div>
      {message.pronunciation && <PronunciationCard state={message.pronunciation} onSpeakWord={onSpeakWord} />}
    </div>
  );
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function barColor(score: number) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

function PronunciationCard({ state, onSpeakWord }: { state: PronunciationState; onSpeakWord: (word: string) => void }) {
  if (state.status === "loading") {
    return <p className="mt-2 text-xs text-muted">🎧 Đang chấm phát âm…</p>;
  }
  if (state.status === "error") {
    return <p className="mt-2 text-xs text-red-600 dark:text-red-400">Chấm phát âm thất bại: {state.message}</p>;
  }

  const { report } = state;
  const areas = [
    { label: "Độ chính xác", value: report.accuracy },
    { label: "Trôi chảy", value: report.fluency },
    { label: "Ngữ điệu, trọng âm", value: report.intonation },
  ];
  return (
    <section className="mt-2 w-full max-w-[90%] rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${scoreColor(report.overall)}`}>{report.overall}</div>
          <div className="text-xs text-muted">Phát âm</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {areas.map((a) => (
            <div key={a.label} className="flex items-center gap-2">
              <span className="w-32 shrink-0 text-xs text-muted">{a.label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <div className={`h-full ${barColor(a.value)}`} style={{ width: `${a.value}%` }} />
              </div>
              <span className="w-7 text-right text-xs tabular-nums">{a.value}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-muted">{report.summary}</p>
      {report.words.length > 0 && (
        <ul className="mt-3 divide-y divide-border">
          {report.words.map((w, i) => (
            <li key={`${w.word}-${i}`} className="flex gap-3 py-2">
              <button
                onClick={() => onSpeakWord(w.word)}
                className="btn-ghost h-fit shrink-0 text-xs"
                aria-label={`Nghe cách đọc ${w.word}`}
              >
                🔊
              </button>
              <div className="min-w-0">
                <p>
                  <span className="font-semibold">{w.word}</span> <span className="text-muted">{w.ipa}</span>
                  <span className="ml-2 text-xs text-red-600 dark:text-red-400">bạn đọc: {w.heard}</span>
                </p>
                <p className="text-muted">{w.issue}</p>
                <p>💡 {w.tip}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Countdown({ phase, onSkip }: { phase: Exclude<Phase, { kind: "idle" }>; onSkip: () => void }) {
  const isPrep = phase.kind === "prep";
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium ${isPrep ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
        {isPrep ? "Chuẩn bị" : "Đang nói"} · {phase.remaining}s
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear ${isPrep ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${(phase.remaining / phase.total) * 100}%` }}
        />
      </div>
      {isPrep && (
        <button onClick={onSkip} className="btn-ghost text-sm">
          Nói ngay
        </button>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-accent" />
      {label}
    </label>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">{children}</div>;
}
