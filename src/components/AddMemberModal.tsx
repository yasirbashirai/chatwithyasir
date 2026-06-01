import { useState } from "react";
import { motion } from "framer-motion";
import { CREW } from "../data/personas";
import { Avatar } from "./Avatar";

const field =
  "w-full glass rounded-2xl px-4 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-teal/40 transition";

export function AddMemberModal({
  presentIds,
  onInvite,
  onInviteGuest,
  onClose,
  isAdmin = false,
}: {
  presentIds: string[];
  onInvite: (id: string) => void;
  onInviteGuest: (info: { name: string; email: string }) => void;
  onClose: () => void;
  isAdmin?: boolean;
}) {
  const available = CREW.filter((c) => !presentIds.includes(c.id));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  const sendInvite = () => {
    if (!valid) return;
    onInviteGuest({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-3xl w-full max-w-sm p-5 relative max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        {/* Invite a real person by email */}
        <h3 className="font-display font-extrabold text-lg text-ink">Invite a teammate</h3>
        <p className="text-sm text-ink/55 mb-3">
          Bring a partner or colleague in, we'll add them here and open an email so you can send the link.
        </p>

        <div className="flex flex-col gap-2.5">
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Their name"
          />
          <input
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="their@email.com"
            onKeyDown={(e) => e.key === "Enter" && sendInvite()}
          />
          <button
            onClick={sendInvite}
            disabled={!valid}
            className="glass-teal gold-ring rounded-2xl py-2.5 text-white font-display font-bold transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Send invite ✉️
          </button>
        </div>

        {/* Yasir's studio crew — admin-only (hidden from clients) */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-ink/10" />
              <span className="text-[12px] text-ink/40 font-semibold">assign Yasir's crew · admin</span>
              <div className="h-px flex-1 bg-ink/10" />
            </div>

            <div className="flex flex-col gap-2">
              {available.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onInvite(c.id)}
                  className="flex items-center gap-3 glass rounded-2xl px-3 py-2.5 text-left hover:bg-teal/10 transition active:scale-[0.98]"
                >
                  <Avatar emoji={c.emoji} color={c.color} size={40} />
                  <div className="flex-1">
                    <div className="font-display font-bold text-ink text-sm">{c.name}</div>
                    <div className="text-[12px] text-ink/55">{c.tagline}</div>
                  </div>
                  <span className="text-teal-dark font-bold text-sm">+ Add</span>
                </button>
              ))}
              {available.length === 0 && (
                <div className="text-center text-sm text-ink/50 py-4">Everyone's already here 🎉</div>
              )}
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5 transition"
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}
