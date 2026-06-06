// Live chat client — talks to the Render server (Express + Socket.IO).
//
// Everything is gated on VITE_API_URL: if it's empty, the site behaves exactly
// as the old static AI-only chat (no capture, no live join). When set, visitors
// are captured durably and Yasir can join conversations in real time.

import { io, type Socket } from "socket.io-client";

const API_URL = ((import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || "").replace(/\/$/, "");

export const liveConfigured = !!API_URL;

/** A message as stored/broadcast by the server. */
export interface ServerMessage {
  id: number;
  conversationId: string;
  sender: "visitor" | "yasir" | "ai" | "system";
  kind: string; // text | audio | image | file | gif | system
  text: string;
  media?: string | null; // base64 data URL (voice note / photo / file) or gif URL
  file_name?: string | null;
  audio_duration?: number | null;
  file_size?: string | null;
  created_at: string;
}

// Cap inline uploads so we don't blow the DB / socket limits (~8mb decoded).
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** A conversation row for the admin list. */
export interface ConversationRow {
  id: string;
  visitor_name: string;
  visitor_email: string;
  source: string;
  status: string;
  human_active: boolean;
  created_at: string;
  last_message_at: string;
  last_text: string | null;
  message_count: number;
}

// ============================ Visitor side ============================

/** Create a conversation (= a captured lead). Returns ids, or null on failure. */
export async function createConversation(
  name: string,
  email: string,
  source = "chat",
): Promise<{ conversationId: string; visitorToken: string } | null> {
  if (!API_URL) return null;
  try {
    const r = await fetch(`${API_URL}/api/conversation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, source }),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/**
 * Persist a message to the server (visitor's own text, or the AI's reply so the
 * transcript stays complete). Fire-and-forget — never blocks the chat.
 */
export async function persistMessage(
  conversationId: string,
  visitorToken: string,
  text: string,
  sender: "visitor" | "ai" = "visitor",
): Promise<void> {
  if (!API_URL || !conversationId || !visitorToken) return;
  try {
    await fetch(`${API_URL}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, visitorToken, text, sender }),
    });
  } catch {
    /* offline — non-blocking */
  }
}

/**
 * Persist a media message (voice note / photo / file) — the media is a base64
 * data URL stored inline. Fire-and-forget. Returns false if it wasn't sent.
 */
export async function persistMedia(
  conversationId: string,
  visitorToken: string,
  payload: {
    kind: "audio" | "image" | "file" | "gif";
    media: string;
    text?: string;
    fileName?: string;
    audioDuration?: number;
    fileSize?: string;
    sender?: "visitor" | "ai";
  },
): Promise<boolean> {
  if (!API_URL || !conversationId || !visitorToken) return false;
  try {
    const r = await fetch(`${API_URL}/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, visitorToken, sender: "visitor", ...payload }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/** Read a Blob/File into a base64 data URL (for inline upload). */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface VisitorHandlers {
  onMessage?: (m: ServerMessage) => void; // Yasir's replies + system lines
  onHumanActive?: (active: boolean) => void; // AI yields / resumes
  onTyping?: () => void; // Yasir is typing
}

/** Open the visitor's realtime socket. Returns the socket (or null). */
export function connectVisitor(
  conversationId: string,
  visitorToken: string,
  handlers: VisitorHandlers,
): Socket | null {
  if (!API_URL || !conversationId || !visitorToken) return null;
  const socket = io(API_URL, {
    auth: { conversationId, visitorToken },
    transports: ["websocket", "polling"],
  });
  // Only surface Yasir's replies + system lines. The visitor already renders
  // their own messages and the AI's replies locally, so ignore those echoes.
  socket.on("message", (m: ServerMessage) => {
    if (m.sender === "yasir" || m.sender === "system") handlers.onMessage?.(m);
  });
  socket.on("human_active", (p: { active: boolean }) => handlers.onHumanActive?.(p.active));
  socket.on("typing", (p: { from: string }) => {
    if (p.from === "yasir") handlers.onTyping?.();
  });
  return socket;
}

export function visitorTyping(socket: Socket | null) {
  socket?.emit("visitor:typing");
}

// ============================ Admin side ============================

export interface AdminHandlers {
  onNew?: (c: ConversationRow) => void; // a new conversation opened
  onUpdate?: (p: { conversationId: string; last_text: string; at: string }) => void;
  onMessage?: (m: ServerMessage) => void; // live message in an opened conversation
  onHumanActive?: (p: { conversationId: string; active: boolean }) => void;
  onTyping?: (p: { conversationId: string; from: string }) => void;
}

/** Open Yasir's admin socket (authenticated by JWT). */
export function connectAdmin(token: string, handlers: AdminHandlers): Socket | null {
  if (!API_URL || !token) return null;
  const socket = io(API_URL, { auth: { token }, transports: ["websocket", "polling"] });
  socket.on("admin:new", (c: ConversationRow) => handlers.onNew?.(c));
  socket.on("admin:update", (p) => handlers.onUpdate?.(p));
  socket.on("message", (m: ServerMessage) => handlers.onMessage?.(m));
  socket.on("human_active", (p) => handlers.onHumanActive?.(p));
  socket.on("typing", (p) => handlers.onTyping?.(p));
  return socket;
}

export const adminOpen = (s: Socket | null, conversationId: string) => s?.emit("admin:open", { conversationId });
export const adminJoin = (s: Socket | null, conversationId: string) => s?.emit("admin:join", { conversationId });
export const adminLeave = (s: Socket | null, conversationId: string) => s?.emit("admin:leave", { conversationId });
export const adminSend = (s: Socket | null, conversationId: string, text: string) =>
  s?.emit("message", { conversationId, text });
export const adminTyping = (s: Socket | null, conversationId: string) => s?.emit("admin:typing", { conversationId });

/** Admin REST: list conversations (newest first). */
export async function fetchConversations(token: string): Promise<ConversationRow[]> {
  if (!API_URL) return [];
  const r = await fetch(`${API_URL}/api/admin/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Could not load conversations");
  return (await r.json()).conversations;
}

/** Admin REST: full transcript for one conversation. */
export async function fetchTranscript(
  token: string,
  id: string,
): Promise<{ conversation: ConversationRow; messages: ServerMessage[] }> {
  if (!API_URL) throw new Error("Not configured");
  const r = await fetch(`${API_URL}/api/admin/conversations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error("Could not load transcript");
  return await r.json();
}
