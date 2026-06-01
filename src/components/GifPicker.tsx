import { useState } from "react";
import { motion } from "framer-motion";
import { GIFS } from "../data/gifs";

export function GifPicker({ onPick }: { onPick: (url: string) => void }) {
  const [q, setQ] = useState("");
  const list = q.trim()
    ? GIFS.filter((g) => g.tags.includes(q.trim().toLowerCase()))
    : GIFS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="glass rounded-2xl p-3 w-[340px] max-w-[85vw]"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search GIFs… (hi, wow, lol, party)"
        className="w-full glass rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink/40 outline-none mb-2"
      />
      <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto no-scrollbar">
        {list.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick(g.full)}
            className="rounded-lg overflow-hidden aspect-square bg-ink/5 hover:ring-2 hover:ring-teal transition active:scale-95"
          >
            <img src={g.preview} alt={g.tags} loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
        {list.length === 0 && (
          <div className="col-span-3 text-center text-sm text-ink/50 py-6">No GIFs, try "wow" or "party"</div>
        )}
      </div>
      <div className="text-[10px] text-ink/30 text-right mt-1.5">Powered by GIPHY</div>
    </motion.div>
  );
}
