import { motion } from "framer-motion";
import type { Bubble, Member, Message, PanelId } from "../types";
import { Avatar } from "./Avatar";
import { QUICK_REACTIONS } from "../data/emojis";

function RichBubble({ bubble, onAction }: { bubble: Bubble; onAction: (p: PanelId) => void }) {
  switch (bubble.kind) {
    case "text":
      return <p className="text-[15px] leading-relaxed text-ink">{bubble.text}</p>;
    case "stat":
      return (
        <div className="grid grid-cols-3 gap-3 py-1">
          {bubble.items.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-extrabold text-teal-dark text-xl leading-none">{s.value}</div>
              <div className="text-[11px] text-ink/60 mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case "services":
      return (
        <div className="flex flex-wrap gap-2 py-1">
          {bubble.items.map((item) => (
            <span
              key={item}
              className="text-[13px] font-medium px-3 py-1.5 rounded-full bg-teal/10 text-teal-dark border border-teal/15"
            >
              {item}
            </span>
          ))}
        </div>
      );
    case "cta":
      return (
        <a
          href={bubble.href}
          target="_blank"
          rel="noreferrer"
          className="glass-teal gold-ring rounded-2xl px-4 py-3 block text-white transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="font-display font-bold text-[15px]">{bubble.label}</div>
          {bubble.note && <div className="text-[12px] text-white/80 mt-0.5">{bubble.note}</div>}
        </a>
      );
    case "links":
      return (
        <div className="flex flex-col gap-1">
          {bubble.items.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-[14px] font-semibold text-teal-dark hover:text-teal px-3 py-2 rounded-xl hover:bg-teal/10 transition"
            >
              {l.label}
            </a>
          ))}
        </div>
      );
    case "actions":
      return (
        <div className="flex flex-wrap gap-2 py-0.5">
          {bubble.items.map((a) => (
            <button
              key={a.panel + a.label}
              onClick={() => onAction(a.panel)}
              className="glass-teal gold-ring rounded-2xl px-4 py-2.5 text-white font-display font-bold text-[14px] transition-transform hover:scale-[1.03] active:scale-95"
            >
              {a.label}
            </button>
          ))}
        </div>
      );
  }
}

function Content({ m, onAction }: { m: Message; onAction: (p: PanelId) => void }) {
  switch (m.kind) {
    case "text":
      return <span className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.text}</span>;
    case "gif":
      return <img src={m.gifUrl} alt="gif" className="rounded-xl max-w-[220px] w-full" />;
    case "image":
      return <img src={m.fileUrl} alt={m.fileName} className="rounded-xl max-w-[240px] w-full" />;
    case "file":
      return (
        <a
          href={m.fileUrl}
          download={m.fileName}
          className="flex items-center gap-3 min-w-[200px] group/file"
        >
          <div className="w-10 h-10 rounded-xl bg-teal/15 flex items-center justify-center text-xl shrink-0">📎</div>
          <div className="min-w-0">
            <div className="font-semibold text-[14px] truncate group-hover/file:underline">{m.fileName}</div>
            <div className="text-[12px] opacity-60">{m.fileSize} · download</div>
          </div>
        </a>
      );
    case "rich":
      return (
        <div className="flex flex-col gap-3">
          {m.bubbles?.map((b, i) => (
            <RichBubble key={i} bubble={b} onAction={onAction} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function MessageRow({
  m,
  sender,
  isMe,
  onReact,
  onAction,
}: {
  m: Message;
  sender?: Member;
  isMe: boolean;
  onReact: (emoji: string) => void;
  onAction: (p: PanelId) => void;
}) {
  if (m.kind === "system") {
    return (
      <div className="flex justify-center my-1">
        <span className="glass rounded-full px-3.5 py-1 text-[12px] text-ink/55">{m.text}</span>
      </div>
    );
  }

  const bare = m.kind === "gif" || m.kind === "image"; // no bubble chrome
  const reactions = Object.entries(m.reactions ?? {}).filter(([, ids]) => ids.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={`flex gap-2.5 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isMe && sender && <Avatar emoji={sender.emoji} color={sender.color} size={36} />}

      <div className={`flex flex-col max-w-[min(78%,520px)] ${isMe ? "items-end" : "items-start"}`}>
        {!isMe && sender && (
          <span className="text-[12px] font-semibold text-ink/55 ml-1 mb-0.5">{sender.name}</span>
        )}

        <div className="relative">
          <div
            className={
              bare
                ? ""
                : isMe
                  ? "glass-teal text-white rounded-3xl rounded-tr-md px-4 py-2.5"
                  : "glass text-ink rounded-3xl rounded-tl-md px-4 py-2.5"
            }
          >
            <Content m={m} onAction={onAction} />
          </div>

          {/* Hover reaction bar */}
          <div
            className={`absolute -top-4 ${isMe ? "left-0" : "right-0"} opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto`}
          >
            <div className="glass rounded-full px-1.5 py-1 flex gap-0.5 shadow-lg">
              {QUICK_REACTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => onReact(e)}
                  className="w-7 h-7 rounded-full text-sm hover:bg-teal/15 hover:scale-125 transition"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reaction pills */}
        {reactions.length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? "flex-row-reverse" : ""}`}>
            {reactions.map(([emoji, ids]) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                className="glass rounded-full px-2 py-0.5 text-[12px] flex items-center gap-1 hover:scale-105 transition"
              >
                <span>{emoji}</span>
                <span className="text-ink/55 font-semibold">{ids.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
