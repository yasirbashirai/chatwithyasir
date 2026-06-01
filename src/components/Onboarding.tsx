import { useState } from "react";
import { motion } from "framer-motion";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "../data/avatars";

export function Onboarding({
  onJoin,
}: {
  onJoin: (me: { name: string; emoji: string; color: string }) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(AVATAR_EMOJIS[0]);
  const [color, setColor] = useState(AVATAR_COLORS[2]);

  const join = () => onJoin({ name: name.trim() || "Guest", emoji, color });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass rounded-[2rem] w-full max-w-md p-7 text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="mx-auto w-20 h-20 rounded-3xl glass-teal gold-ring flex items-center justify-center font-accent italic text-white text-3xl"
        >
          YB
        </motion.div>
        <h1 className="font-display font-extrabold text-2xl text-ink mt-4">Yasir's Studio</h1>
        <p className="text-ink/60 text-sm mt-1">
          Premium websites & AI growth systems — <span className="font-accent italic">engineered to convert.</span>
        </p>

        <div className="h-px bg-ink/10 my-6" />

        <p className="font-display font-bold text-ink text-sm mb-3">Choose your vibe to join the chat</p>

        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && join()}
          placeholder="Your name…"
          maxLength={20}
          className="w-full glass rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink/40 outline-none text-center mb-4"
        />

        {/* Preview */}
        <div className="flex items-center justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl gold-ring"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
          >
            {emoji}
          </div>
        </div>

        {/* Emoji picker */}
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
        <div className="flex flex-wrap justify-center gap-2 mb-6">
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
          className="glass-teal gold-ring w-full rounded-2xl py-3.5 font-display font-bold text-white text-base transition-transform hover:scale-[1.02] active:scale-95"
        >
          Join the chat →
        </button>
      </motion.div>
    </div>
  );
}
