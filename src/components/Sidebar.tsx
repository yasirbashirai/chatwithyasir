import { motion } from "framer-motion";
import type { Member } from "../types";
import { Avatar } from "./Avatar";

export function Sidebar({
  members,
  meId,
  onAdd,
  open,
  onClose,
}: {
  members: Member[];
  meId: string;
  onAdd: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-ink/20 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <motion.aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-72 shrink-0 p-3 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="glass rounded-3xl h-full flex flex-col p-4">
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-10 h-10 rounded-2xl glass-teal gold-ring flex items-center justify-center font-accent italic text-white text-lg">
              YB
            </div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-ink text-[15px]">Yasir's Studio</div>
              <div className="text-[11px] text-teal-dark">{members.length} in the group</div>
            </div>
          </div>

          <div className="h-px bg-ink/10 my-4" />

          <div className="text-[11px] font-bold uppercase tracking-wider text-ink/40 px-1 mb-2">
            Members
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-1.5 py-1.5 rounded-2xl hover:bg-ink/5">
                <div className="relative">
                  <Avatar emoji={m.emoji} color={m.color} size={36} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-light border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-ink text-sm truncate">
                    {m.name}
                    {m.id === meId && <span className="text-ink/40 font-normal"> (you)</span>}
                  </div>
                  <div className="text-[11px] text-ink/50 truncate">
                    {m.role === "host" ? "👑 Host" : m.role === "bot" ? m.tagline : "Guest"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onAdd}
            className="mt-3 glass-teal gold-ring rounded-2xl py-3 font-display font-bold text-white text-sm transition-transform hover:scale-[1.02] active:scale-95"
          >
            ➕ Add member
          </button>
        </div>
      </motion.aside>
    </>
  );
}
