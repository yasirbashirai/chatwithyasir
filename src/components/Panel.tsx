import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Panel — the shared liquid-glass popover shell used for all in-chat
 * client actions (book a call, start a project, portfolio, pricing).
 * Backdrop click + ✕ both close it; content scrolls if it's tall.
 */
export function Panel({
  title,
  subtitle,
  emoji,
  onClose,
  children,
  maxWidth = "max-w-md",
  footer,
}: {
  title: string;
  subtitle?: string;
  emoji?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass rounded-3xl w-full ${maxWidth} relative flex flex-col max-h-[88vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 pb-3 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-extrabold text-lg text-ink leading-tight">
              {emoji && <span className="mr-1.5">{emoji}</span>}
              {title}
            </h3>
            {subtitle && <p className="text-sm text-ink/55 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-8 h-8 rounded-full hover:bg-ink/5 flex items-center justify-center text-ink/50 text-lg transition active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-5 pb-5 overflow-y-auto no-scrollbar">{children}</div>

        {footer && <div className="p-4 border-t border-white/40 shrink-0">{footer}</div>}
      </motion.div>
    </div>
  );
}
