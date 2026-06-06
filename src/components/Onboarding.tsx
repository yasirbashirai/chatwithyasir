import { useState } from "react";
import { motion } from "framer-motion";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "../data/avatars";
import type { Profile } from "../lib/session";

export function Onboarding({
  onJoin,
  hasSaved,
  onResume,
  profile,
  onContinue,
}: {
  onJoin: (me: { name: string; emoji: string; color: string; email: string }) => void;
  hasSaved?: boolean;
  onResume?: () => void;
  profile?: Profile | null;
  onContinue?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emoji, setEmoji] = useState(AVATAR_EMOJIS[0]);
  const [color, setColor] = useState(AVATAR_COLORS[2]);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const canJoin = name.trim().length > 0 && emailOk;
  const join = () => canJoin && onJoin({ name: name.trim(), emoji, color, email: email.trim() });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass rounded-[2rem] w-full max-w-md md:max-w-3xl p-7 md:p-9 max-h-[94vh] overflow-y-auto no-scrollbar
                   md:grid md:grid-cols-2 md:gap-9 md:items-center"
      >
        {/* ── Left: brand + live preview ── */}
        <div className="text-center md:text-left">
          <motion.div
            initial={{ scale: 0.6, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="mx-auto md:mx-0 w-20 h-20 rounded-3xl glass-teal gold-ring flex items-center justify-center font-accent italic text-white text-3xl"
          >
            YB
          </motion.div>
          <h1 className="font-display font-extrabold text-2xl md:text-3xl text-ink mt-4">Yasir's Studio</h1>
          <p className="text-ink/60 text-sm mt-1">
            Premium websites & AI growth systems, <span className="font-accent italic">engineered to convert.</span>
          </p>

          {/* Live avatar preview */}
          <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl gold-ring shrink-0"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              {emoji}
            </div>
            <div className="text-left leading-tight">
              <div className="font-display font-bold text-ink">{name.trim() || "Your name"}</div>
              <div className="text-[12px] text-ink/50">{email.trim() || "you@email.com"}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            {profile && onContinue && (
              <button
                onClick={onContinue}
                className="w-full glass-teal gold-ring rounded-2xl py-2.5 px-3 flex items-center gap-2.5 text-white text-left transition-transform hover:scale-[1.02] active:scale-95"
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 bg-white/20"
                >
                  {profile.emoji}
                </span>
                <span className="leading-tight min-w-0">
                  <span className="block font-display font-bold text-sm truncate">Continue as {profile.name}</span>
                  <span className="block text-[11px] text-white/80 truncate">{profile.email}</span>
                </span>
              </button>
            )}
            {hasSaved && (
              <button
                onClick={onResume}
                className="w-full md:w-auto md:px-5 glass rounded-2xl py-3 font-display font-bold text-teal-dark text-sm hover:bg-teal/10 transition active:scale-[0.98]"
              >
                ⏯️ Resume your conversation
              </button>
            )}
          </div>
        </div>

        {/* Divider (mobile only) */}
        <div className="h-px bg-ink/10 my-6 md:hidden" />

        {/* ── Right: the form ── */}
        <div>
          <p className="font-display font-bold text-ink text-sm mb-3">Choose your vibe to join the chat</p>

          {/* Name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="Your name…"
            maxLength={28}
            className="w-full glass rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none mb-3"
          />

          {/* Email */}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            type="email"
            placeholder="Your email…"
            className="w-full glass rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none mb-1"
          />
          <p className="text-[11px] text-ink/45 mb-4">
            So Yasir knows who he's talking to. No spam, ever. Your chat may be saved and read by
            Yasir so he can jump in and help.
          </p>

          {/* Emoji picker */}
          <div className="text-[12px] font-semibold text-ink/50 mb-1.5">Pick an avatar</div>
          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition ${
                  emoji === e ? "bg-teal/20 scale-110" : "hover:bg-ink/5"
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Color picker */}
          <div className="text-[12px] font-semibold text-ink/50 mb-1.5">Pick a color</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {AVATAR_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-ink/40 scale-110" : ""}`}
                style={{ background: c }}
                aria-label={c}
              />
            ))}
          </div>

          <button
            onClick={join}
            disabled={!canJoin}
            className="glass-teal gold-ring w-full rounded-2xl py-3.5 font-display font-bold text-white text-base transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Join the chat →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
