// In-chat popovers a client can open to self-serve onboarding actions.
export type PanelId = "book" | "project" | "portfolio" | "pricing";

export type Bubble =
  | { kind: "text"; text: string }
  | { kind: "stat"; items: { value: string; label: string }[] }
  | { kind: "services"; items: string[] }
  | { kind: "cta"; label: string; href: string; note?: string }
  | { kind: "links"; items: { label: string; href: string }[] }
  // Buttons that open an in-chat popover (booking, onboarding form, etc.)
  | { kind: "actions"; items: { label: string; panel: PanelId }[] };

export interface Member {
  id: string;
  name: string;
  emoji: string;
  color: string; // hex
  role: "host" | "bot" | "guest";
  tagline?: string;
  email?: string; // set for people the client invites
}

export type MsgKind = "text" | "gif" | "image" | "file" | "audio" | "rich" | "system";

/** WhatsApp-style delivery state, shown on the visitor's own messages. */
export type MsgStatus = "sent" | "delivered" | "seen";

export interface Message {
  id: number;
  senderId: string; // member id, or "me"
  kind: MsgKind;
  text?: string;
  gifUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  audioUrl?: string;
  audioDuration?: number; // seconds
  bubbles?: Bubble[];
  reactions?: Record<string, string[]>; // emoji -> memberIds
  ts: number;
  at?: number; // wall-clock epoch ms (for time + day dividers)
  status?: MsgStatus; // only on "me" messages
}
