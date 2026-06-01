import { Panel } from "./Panel";
import { Avatar } from "./Avatar";
import type { Member } from "../types";

/**
 * ProfilePanel — the visitor's own profile. Shows who they're signed in as and
 * lets them sign out (which ends this conversation and returns to the start,
 * where they can sign back in as themselves or someone new).
 */
export function ProfilePanel({ me, onSignOut, onClose }: { me: Member; onSignOut: () => void; onClose: () => void }) {
  return (
    <Panel emoji="👤" title="Your profile" onClose={onClose} maxWidth="max-w-sm">
      <div className="flex items-center gap-4 mb-5">
        <Avatar emoji={me.emoji} color={me.color} size={56} ring />
        <div className="min-w-0">
          <div className="font-display font-extrabold text-ink text-lg truncate">{me.name}</div>
          {me.email && <div className="text-[13px] text-ink/55 truncate">{me.email}</div>}
          <div className="text-[12px] text-teal-dark mt-0.5">Signed in</div>
        </div>
      </div>

      <button
        onClick={onSignOut}
        className="w-full glass rounded-2xl py-3 font-display font-bold text-red-500 hover:bg-red-500/10 transition active:scale-[0.98]"
      >
        Sign out
      </button>
      <p className="text-[11px] text-ink/45 text-center mt-2">
        Signing out ends this chat. You can sign back in anytime.
      </p>
    </Panel>
  );
}
