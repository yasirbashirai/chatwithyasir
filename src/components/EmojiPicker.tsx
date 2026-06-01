import { motion } from "framer-motion";
import { EMOJIS } from "../data/emojis";

export function EmojiPicker({ onPick }: { onPick: (e: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.96 }}
      className="glass rounded-2xl p-3 w-[320px] max-w-[80vw]"
    >
      <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto no-scrollbar">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => onPick(e)}
            className="aspect-square rounded-lg text-lg flex items-center justify-center hover:bg-teal/15 transition active:scale-90"
          >
            {e}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
