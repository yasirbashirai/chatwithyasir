import { useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { EmojiPicker } from "./EmojiPicker";
import { GifPicker } from "./GifPicker";

export function Composer({
  onText,
  onGif,
  onFile,
  disabled,
  placeholder = "Message Yasir's Studio…",
}: {
  onText: (t: string) => void;
  onGif: (url: string) => void;
  onFile: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [picker, setPicker] = useState<null | "emoji" | "gif">(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

      <div className="glass rounded-[1.75rem] p-2 flex items-center gap-1">
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
      </div>
    </div>
  );
}
