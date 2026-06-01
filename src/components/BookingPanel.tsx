import { Panel } from "./Panel";
import { CAL_URL, CONTACT_EMAIL } from "../data/config";

/**
 * BookingPanel — embeds Yasir's real Cal.com 30-min call inside the chat so a
 * client can book without leaving. Cal.com emails Yasir on booking. Falls back
 * to opening the page in a new tab + an email option.
 */
export function BookingPanel({ onClose }: { onClose: () => void }) {
  return (
    <Panel
      emoji="📅"
      title="Book a 30-min call"
      subtitle="Pick a time that works — it lands straight on Yasir's calendar."
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <a
            href={CAL_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-teal-dark hover:text-teal transition"
          >
            Open in new tab ↗
          </a>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Booking%20a%20call`}
            className="font-semibold text-ink/55 hover:text-ink transition"
          >
            Prefer email?
          </a>
        </div>
      }
    >
      <div className="rounded-2xl overflow-hidden border border-white/50 bg-white/40">
        <iframe
          src={CAL_URL}
          title="Book a call with Yasir"
          className="w-full h-[60vh] min-h-[420px]"
          loading="lazy"
        />
      </div>
    </Panel>
  );
}
