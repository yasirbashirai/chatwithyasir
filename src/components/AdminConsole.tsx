import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { Panel } from "./Panel";
import { adminLogin } from "../lib/api";
import { playAlert, playReceive } from "../lib/sound";
import {
  liveConfigured,
  connectAdmin,
  fetchConversations,
  fetchTranscript,
  adminOpen,
  adminJoin,
  adminSend,
  type ConversationRow,
  type ServerMessage,
} from "../lib/live";

/**
 * AdminConsole — Yasir's live dashboard. Sign in once (JWT kept in
 * localStorage), see every visitor conversation update in real time, open a
 * transcript, then JOIN to chat live — at which point the AI yields to him.
 */
const TOKEN_KEY = "cwy_admin_token";
const field =
  "w-full glass rounded-2xl px-4 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-teal/40 transition";

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

export function AdminConsole({ onClose, focusId }: { onClose: () => void; focusId?: string }) {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [convs, setConvs] = useState<ConversationRow[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<ServerMessage[] | null>(null);
  const [joined, setJoined] = useState(false);
  const [reply, setReply] = useState("");
  // Conversations with activity you haven't looked at yet (show a NEW badge).
  const [unread, setUnread] = useState<Set<string>>(new Set());

  const socketRef = useRef<Socket | null>(null);
  const selIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const focusedRef = useRef(false);

  // Reorder helper: bump a conversation to the top with fresh last message.
  const bump = (id: string, patch: Partial<ConversationRow>) =>
    setConvs((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      if (idx < 0) return prev;
      const updated = { ...prev[idx], ...patch };
      const rest = prev.filter((c) => c.id !== id);
      return [updated, ...rest];
    });

  const markUnread = (id: string) => setUnread((prev) => new Set(prev).add(id));
  const clearUnread = (id: string) =>
    setUnread((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  // Browser popup (only fires if the visitor granted permission). Best-effort.
  const notifyBrowser = (title: string, body: string) => {
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    } catch {
      /* notifications unsupported / blocked */
    }
  };

  const openConversation = async (id: string, t = token) => {
    setSelId(id);
    selIdRef.current = id;
    clearUnread(id);
    setTranscript(null);
    adminOpen(socketRef.current, id);
    try {
      const data = await fetchTranscript(t, id);
      setTranscript(data.messages);
      setJoined(!!data.conversation.human_active);
    } catch {
      setTranscript([]);
    }
  };

  const init = async (t: string) => {
    setBusy(true);
    setError("");
    try {
      const list = await fetchConversations(t);
      setConvs(list);
      // Ask for permission to show desktop popups (sound works regardless).
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "default") {
          Notification.requestPermission();
        }
      } catch {
        /* ignore */
      }
      // Open the realtime admin feed.
      socketRef.current?.disconnect();
      socketRef.current = connectAdmin(t, {
        onNew: (c) => {
          setConvs((prev) => [c, ...prev.filter((x) => x.id !== c.id)]);
          markUnread(c.id);
          playAlert(); // 🔔 a new visitor just opened a chat
          notifyBrowser("💬 New chat", `${c.visitor_name || "A visitor"} just opened your site`);
        },
        onUpdate: ({ conversationId, last_text, at }) =>
          bump(conversationId, { last_text, last_message_at: at }),
        onMessage: (m) => {
          if (m.conversationId === selIdRef.current) {
            setTranscript((prev) => (prev ? [...prev, m] : [m]));
          } else if (m.sender === "visitor") {
            // A new message in a conversation you're not currently viewing.
            markUnread(m.conversationId);
            playReceive();
          }
        },
        onHumanActive: ({ conversationId, active }) => {
          bump(conversationId, { human_active: active });
          if (conversationId === selIdRef.current) setJoined(active);
        },
      });
      // Auto-open the conversation from an email-alert deep link (once).
      if (focusId && !focusedRef.current) {
        focusedRef.current = true;
        openConversation(focusId, t);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken("");
      setError("Session expired, please sign in again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (token) init(token);
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const signIn = async () => {
    setBusy(true);
    setError("");
    try {
      const { token: t } = await adminLogin(email, password);
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      await init(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    socketRef.current?.disconnect();
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setConvs([]);
    setSelId(null);
    setTranscript(null);
  };

  const doJoin = () => {
    if (!selId) return;
    adminJoin(socketRef.current, selId);
    setJoined(true);
  };

  const sendReply = () => {
    const t = reply.trim();
    if (!t || !selId) return;
    adminSend(socketRef.current, selId, t);
    setReply("");
  };

  // ---- Not configured ----
  if (!liveConfigured) {
    return (
      <Panel emoji="🗂" title="Admin console" onClose={onClose} maxWidth="max-w-md">
        <p className="text-[15px] text-ink/75 leading-relaxed">
          The live backend isn't connected yet. Deploy the server in{" "}
          <code className="bg-ink/5 px-1 rounded">server/</code> and set{" "}
          <code className="bg-ink/5 px-1 rounded">VITE_API_URL</code> to its URL to enable
          visitor capture, email alerts, and live join.
        </p>
      </Panel>
    );
  }

  // ---- Logged out ----
  if (!token) {
    return (
      <Panel
        emoji="🔐"
        title="Admin sign in"
        subtitle="Yasir only."
        onClose={onClose}
        maxWidth="max-w-sm"
        footer={
          <button
            onClick={signIn}
            disabled={busy || !email || !password}
            className="w-full glass-teal gold-ring rounded-2xl py-3 text-white font-display font-bold transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        }
      >
        <div className="flex flex-col gap-3">
          <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className={field}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
          />
          {error && <p className="text-[13px] text-red-500 font-medium">{error}</p>}
        </div>
      </Panel>
    );
  }

  // ---- Transcript / live thread for one conversation ----
  if (selId) {
    const conv = convs.find((c) => c.id === selId);
    return (
      <Panel
        emoji="💬"
        title={conv?.visitor_name || "Conversation"}
        subtitle={conv?.visitor_email}
        onClose={onClose}
        maxWidth="max-w-2xl"
        footer={
          joined ? (
            <div className="flex items-center gap-2">
              <input
                className={field}
                placeholder="Reply as Yasir…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendReply()}
              />
              <button
                onClick={sendReply}
                disabled={!reply.trim()}
                className="glass-teal gold-ring rounded-2xl px-5 py-2.5 text-white font-bold shrink-0 disabled:opacity-40 transition active:scale-95"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => { setSelId(null); selIdRef.current = null; }} className="font-semibold text-ink/55 hover:text-ink transition text-sm">
                ← Back
              </button>
              <button
                onClick={doJoin}
                className="glass-teal gold-ring rounded-2xl px-5 py-2.5 text-white font-display font-bold transition active:scale-95"
              >
                Join chat live →
              </button>
            </div>
          )
        }
      >
        {joined && (
          <button
            onClick={() => { setSelId(null); selIdRef.current = null; }}
            className="mb-3 font-semibold text-ink/55 hover:text-ink transition text-sm"
          >
            ← All conversations
          </button>
        )}
        {!transcript ? (
          <div className="text-center text-sm text-ink/50 py-10">Loading…</div>
        ) : transcript.length === 0 ? (
          <div className="text-center text-sm text-ink/50 py-10">No messages yet.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {transcript.map((m) => {
              if (m.sender === "system") {
                return (
                  <div key={m.id} className="text-center text-[12px] text-ink/45 my-1">
                    {m.text}
                  </div>
                );
              }
              const mine = m.sender === "yasir";
              const tag = m.sender === "ai" ? "AI" : m.sender === "visitor" ? conv?.visitor_name || "Visitor" : "You";
              const isImg = (m.kind === "image" || m.kind === "gif") && m.media;
              return (
                <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <span className="text-[10px] font-semibold text-ink/40 mb-0.5 px-1">{tag}</span>
                  {isImg ? (
                    <a href={m.media!} target="_blank" rel="noopener noreferrer">
                      <img src={m.media!} alt="" className="max-w-[220px] max-h-[220px] rounded-2xl object-cover" />
                    </a>
                  ) : (
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-wrap ${
                        mine ? "glass-teal text-white" : m.sender === "ai" ? "bg-teal/10 text-ink" : "glass text-ink"
                      }`}
                    >
                      {m.kind === "audio" && m.media ? (
                        <audio controls src={m.media} className="max-w-[240px] align-middle" />
                      ) : m.kind === "file" && m.media ? (
                        <a href={m.media} download={m.file_name || "file"} className="underline break-all">
                          📎 {m.file_name || "Download file"}
                          {m.file_size ? ` · ${m.file_size}` : ""}
                        </a>
                      ) : (
                        m.text
                      )}
                    </div>
                  )}
                  <span className="text-[10px] text-ink/35 mt-0.5 px-1">{timeAgo(m.created_at)}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </Panel>
    );
  }

  // ---- Conversation list ----
  return (
    <Panel
      emoji="🗂"
      title="Conversations"
      subtitle={
        unread.size
          ? `🔔 ${unread.size} new · ${convs.length} total`
          : convs.length
            ? `${convs.length} total · updates live`
            : "updates live"
      }
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between text-sm">
          <button onClick={() => init(token)} className="font-semibold text-teal-dark hover:text-teal transition">
            ↻ Refresh
          </button>
          <button onClick={signOut} className="font-semibold text-ink/55 hover:text-ink transition">
            Sign out
          </button>
        </div>
      }
    >
      {error && <p className="text-[13px] text-red-500 font-medium mb-3">{error}</p>}
      {convs.length === 0 ? (
        <div className="text-center text-sm text-ink/50 py-10">{busy ? "Loading…" : "No conversations yet."}</div>
      ) : (
        <div className="flex flex-col gap-2">
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition active:scale-[0.99] ${
                unread.has(c.id) ? "glass ring-2 ring-gold/60 bg-gold/5" : "glass hover:bg-teal/5"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.human_active ? "bg-gold" : "bg-teal"}`}
                title={c.human_active ? "You're handling this" : "AI is handling this"}
              />
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-ink text-sm truncate flex items-center gap-1.5">
                  {c.visitor_name || "(no name)"}
                  {unread.has(c.id) && (
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-gold text-ink px-1.5 py-0.5 rounded-md shrink-0">
                      New
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-ink/55 truncate">{c.last_text || c.visitor_email}</div>
              </div>
              <div className="text-[11px] text-ink/40 shrink-0">{timeAgo(c.last_message_at)}</div>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
