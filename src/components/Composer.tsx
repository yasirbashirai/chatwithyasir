import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmojiPicker } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";

const fmtClock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function Composer({
  onText,
  onGif,
  onFile,
  onAudio,
  disabled,
  placeholder = "Message Yasir's Studio…",
}: {
  onText: (t: string) => void;
  onGif: (url: string) => void;
  onFile: (file: File) => void;
  onAudio?: (blob: Blob, durationSec: number) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [picker, setPicker] = useState<null | "emoji" | "gif">(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- Voice recording ----
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micDenied, setMicDenied] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // When false, the recording is discarded instead of sent on stop.
  const keepRef = useRef(true);
  // Mirror elapsed in a ref so the recorder's onstop closure reads the latest value.
  const elapsedRef = useRef(0);

  const canRecord =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window !== "undefined" &&
    "MediaRecorder" in window;

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Stop tracks if the component unmounts mid-recording.
  useEffect(() => () => cleanupStream(), []);

  const startRecording = async () => {
    if (!canRecord || disabled) return;
    setPicker(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      keepRef.current = true;
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const seconds = elapsedRef.current;
        cleanupStream();
        setRecording(false);
        setElapsed(0);
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        if (keepRef.current && blob.size > 0 && seconds >= 1) {
          onAudio?.(blob, seconds);
        }
      };
      rec.start();
      setRecording(true);
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          elapsedRef.current = next;
          return next;
        });
      }, 1000);
    } catch {
      setMicDenied(true);
      cleanupStream();
    }
  };

  const stopRecording = (keep: boolean) => {
    keepRef.current = keep;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      cleanupStream();
      setRecording(false);
      setElapsed(0);
    }
  };

  const send = () => {
    const t = value.trim();
    if (!t) return;
    onText(t);
    setValue("");
  };

  return (
    <div className="relative">
      {/* Pickers */}
      <AnimatePresence>
        {picker === "emoji" && (
          <div className="absolute bottom-full mb-3 left-0 z-30">
            <EmojiPicker
              onPick={(e) => {
                setValue((v) => v + e);
              }}
            />
          </div>
        )}
        {picker === "gif" && (
          <div className="absolute bottom-full mb-3 left-0 z-30">
            <GifPicker
              onPick={(url) => {
                onGif(url);
                setPicker(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {micDenied && (
        <div className="absolute bottom-full mb-2 left-0 right-0 z-30 flex justify-center">
          <span className="glass rounded-full px-3 py-1.5 text-[12px] text-ink/70">
            🎙️ Microphone access blocked — allow it in your browser to send voice notes.
          </span>
        </div>
      )}

      <div className="glass rounded-[1.75rem] p-2 flex items-center gap-1">
        {recording ? (
          /* ---------- RECORDING BAR ---------- */
          <>
            <button
              onClick={() => stopRecording(false)}
              className="w-10 h-10 rounded-full text-lg flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition active:scale-90"
              aria-label="Cancel recording"
            >
              🗑️
            </button>
            <div className="flex-1 flex items-center gap-2 px-2 min-w-0">
              <motion.span
                className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[14px] font-semibold text-ink tabular-nums">
                {fmtClock(elapsed)}
              </span>
              <span className="text-[13px] text-ink/45 truncate">Recording…</span>
            </div>
            <button
              onClick={() => stopRecording(true)}
              className="glass-teal gold-ring w-11 h-11 rounded-full flex items-center justify-center text-white transition-transform active:scale-90 shrink-0"
              aria-label="Send voice message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </>
        ) : (
          /* ---------- DEFAULT BAR ---------- */
          <>
            {/* Emoji */}
            <button
              onClick={() => setPicker((p) => (p === "emoji" ? null : "emoji"))}
              className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition active:scale-90 ${
                picker === "emoji" ? "bg-teal/20" : "hover:bg-ink/5"
              }`}
              aria-label="Emoji"
            >
              😊
            </button>
            {/* GIF */}
            <button
              onClick={() => setPicker((p) => (p === "gif" ? null : "gif"))}
              className={`h-10 px-2.5 rounded-full text-[12px] font-extrabold tracking-wide flex items-center justify-center transition active:scale-90 ${
                picker === "gif" ? "bg-teal/20 text-teal-dark" : "text-ink/55 hover:bg-ink/5"
              }`}
              aria-label="GIF"
            >
              GIF
            </button>
            {/* File */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-10 h-10 rounded-full text-lg flex items-center justify-center hover:bg-ink/5 transition active:scale-90"
              aria-label="Attach file"
            >
              📎
            </button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />

            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setPicker(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/40 outline-none min-w-0"
            />

            {/* Mic — shown when there's nothing typed; morphs into Send when typing */}
            {onAudio && canRecord && !value.trim() ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className="w-11 h-11 rounded-full flex items-center justify-center text-teal-dark hover:bg-teal/15 disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-90 shrink-0"
                aria-label="Record voice message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!value.trim() || disabled}
                className="glass-teal gold-ring w-11 h-11 rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-transform active:scale-90 shrink-0"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
