import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Member, Message, PanelId } from "./types";
import { BIO, OPENING_CHIPS, FALLBACK, ANSWERS } from "./data/conversation";
import { HOST, botById } from "./data/personas";
import { answerById, matchAnswer } from "./lib/match";
import { Onboarding } from "./components/Onboarding";
import { Sidebar } from "./components/Sidebar";
import { Composer } from "./components/Composer";
import { MessageRow } from "./components/MessageRow";
import { AddMemberModal } from "./components/AddMemberModal";
import { Avatar } from "./components/Avatar";
import { BookingPanel } from "./components/BookingPanel";
import { ProjectFormPanel } from "./components/ProjectFormPanel";
import { PortfolioPanel } from "./components/PortfolioPanel";
import { PricingPanel } from "./components/PricingPanel";
import { AdminConsole } from "./components/AdminConsole";
import { ProfilePanel } from "./components/ProfilePanel";
import { postLead } from "./lib/api";
import { loadSession, saveSession, clearSession, loadProfile, saveProfile, clearProfile, type Session } from "./lib/session";
import { saveTranscriptAsPdf } from "./lib/transcript";
import { playStart, playSend, playReceive, playTap, playTyping, soundEnabled, setSoundEnabled } from "./lib/sound";

// Admin (Yasir) mode — opened via ?admin=yasir or #admin. Reveals the crew and
// lets Yasir chat as himself. (True cross-device live chat needs a backend.)
const IS_ADMIN = (() => {
  try {
    const p = new URLSearchParams(window.location.search);
    return p.get("admin") === "yasir" || window.location.hash === "#admin";
  } catch {
    return false;
  }
})();

const ADMIN_WELCOME: Message = {
  id: 0,
  ts: 0,
  senderId: "sys",
  kind: "system",
  text: "Admin mode: you're chatting as Yasir. Assign crew with ＋.",
};

// Decide the starting state: admin chat, a resumed session, or fresh onboarding.
function computeBoot(): Session {
  if (IS_ADMIN) return { phase: "chat", me: HOST, members: [HOST], messages: [ADMIN_WELCOME], chips: [] };
  const saved = loadSession();
  if (saved) return saved;
  return { phase: "onboarding", me: null, members: [HOST], messages: [], chips: [] };
}

// Avatar looks cycled through for people a client invites.
const GUEST_LOOKS: { emoji: string; color: string }[] = [
  { emoji: "🧑", color: "#6366F1" },
  { emoji: "👩", color: "#EC4899" },
  { emoji: "🧔", color: "#0EA5E9" },
  { emoji: "🧑‍💼", color: "#F59E0B" },
  { emoji: "👨‍💻", color: "#10B981" },
];

// Always-available client actions, surfaced as a quick-access bar.
const QUICK_ACTIONS: { panel: PanelId; label: string }[] = [
  { panel: "book", label: "📅 Book a call" },
  { panel: "project", label: "🚀 Start a project" },
  { panel: "portfolio", label: "👀 Portfolio" },
  { panel: "pricing", label: "💰 Pricing" },
];

// Day-divider helpers (WhatsApp-style "Today / Yesterday / Mar 4").
const dayStart = (ms: number) => {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const sameDay = (a: number, b: number) => dayStart(a) === dayStart(b);
const dayLabel = (ms: number) => {
  const diff = (dayStart(Date.now()) - dayStart(ms)) / 86400000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(ms).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

export default function App() {
  const bootRef = useRef<Session | null>(null);
  if (!bootRef.current) bootRef.current = computeBoot();
  const boot = bootRef.current;

  const [phase, setPhase] = useState<"onboarding" | "chat">(boot.phase);
  const [me, setMe] = useState<Member | null>(boot.me);
  const [members, setMembers] = useState<Member[]>(boot.members);
  const [messages, setMessages] = useState<Message[]>(boot.messages);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>(boot.chips);
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [savedExists, setSavedExists] = useState(() => !IS_ADMIN && !!loadSession());
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(loadProfile);

  const idRef = useRef(boot.messages.reduce((mx, m) => Math.max(mx, m.id), 0));
  const tsRef = useRef(boot.messages.reduce((mx, m) => Math.max(mx, m.ts), 0));
  const busyRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;
  const nextTs = () => ++tsRef.current;
  const memberById = (id: string): Member | undefined =>
    id === "me" ? me ?? undefined : members.find((m) => m.id === id);

  const pushMsg = (partial: Omit<Message, "id" | "ts">) =>
    setMessages((m) => [...m, { ...partial, id: nextId(), ts: nextTs(), at: Date.now() }]);

  // Upgrade-only delivery state for the visitor's own messages (sent→delivered→seen).
  const STATUS_RANK = { sent: 0, delivered: 1, seen: 2 } as const;
  const setMyStatus = (status: "sent" | "delivered" | "seen") =>
    setMessages((ms) =>
      ms.map((m) =>
        m.senderId === "me" && STATUS_RANK[m.status ?? "sent"] < STATUS_RANK[status]
          ? { ...m, status }
          : m,
      ),
    );

  // typing → push, with a human pause
  const say = async (senderId: string, partial: Omit<Message, "id" | "ts" | "senderId">, typingMs = 650) => {
    setTypingId(senderId);
    playTyping(); // soft tick while the dots show
    await sleep(typingMs);
    setTypingId(null);
    pushMsg({ senderId, ...partial });
    await sleep(180);
  };

  // Stream one of Yasir's scripted answers as several chat bubbles.
  const yasirRespond = async (bubbles: typeof BIO, followups: string[]) => {
    for (const b of bubbles) {
      if (b.kind === "text") await say("yasir", { kind: "text", text: b.text });
      else await say("yasir", { kind: "rich", bubbles: [b] }, 820);
    }
    playReceive(); // gentle chime once the reply has fully landed
    setChips(followups);
  };

  // A present crew bot occasionally chimes in.
  const maybeChime = async () => {
    const bots = members.filter((m) => m.role === "bot");
    if (!bots.length || Math.random() > 0.55) return;
    const bot = bots[Math.floor(Math.random() * bots.length)];
    const persona = botById(bot.id);
    if (!persona) return;
    const quip = persona.quips[Math.floor(Math.random() * persona.quips.length)];
    await sleep(300);
    await say(bot.id, { kind: "text", text: quip }, 700);
  };

  const run = async (fn: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setChips([]);
    try {
      await fn();
    } finally {
      busyRef.current = false;
    }
  };

  // ---- Actions ----
  const join = (info: { name: string; emoji: string; color: string; email: string }) => {
    const meMember: Member = { id: "me", role: "guest", ...info };
    setMe(meMember);
    setMembers([HOST, meMember]);
    setProfile(info); // remember for quick sign-in next time
    saveProfile(info);
    setPhase("chat");
    playStart();
    postLead({ name: info.name, email: info.email, source: "onboarding" }); // captured if backend is configured
    run(async () => {
      pushMsg({ senderId: "sys", kind: "system", text: `${info.name} joined the chat 🎉` });
      await sleep(400);
      await yasirRespond(BIO, OPENING_CHIPS);
    });
  };

  // Open an in-chat popover with a soft tap sound.
  const openPanel = (p: PanelId) => {
    playTap();
    setActivePanel(p);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playTap();
  };

  // ---- Pause / resume / export ----
  const resumeSaved = () => {
    const s = loadSession();
    if (!s) return;
    setMe(s.me);
    setMembers(s.members);
    setMessages(s.messages);
    setChips(s.chips);
    idRef.current = s.messages.reduce((mx, m) => Math.max(mx, m.id), 0);
    tsRef.current = s.messages.reduce((mx, m) => Math.max(mx, m.ts), 0);
    setPhase("chat");
    playStart();
  };

  const pauseExit = () => {
    setPhase("onboarding"); // session stays saved → "Resume" appears
  };

  const startOver = () => {
    clearSession();
    clearProfile();
    setProfile(null);
    setSavedExists(false);
    setMessages([]);
    setMembers([HOST]);
    setMe(null);
    setChips([]);
    setPhase("onboarding");
  };

  // Client signs out: ends this conversation but keeps their remembered profile
  // so they can sign back in (Continue as …) from the welcome screen.
  const signOut = () => {
    clearSession();
    setSavedExists(false);
    setShowProfile(false);
    setMessages([]);
    setMembers([HOST]);
    setMe(null);
    setChips([]);
    setPhase("onboarding");
  };

  const savePdf = () => saveTranscriptAsPdf({ me, members, messages });

  // Admin (Yasir) sends as himself, bypassing the scripted brain.
  const adminSay = (text: string) => {
    if (busyRef.current) return;
    pushMsg({ senderId: "yasir", kind: "text", text });
  };

  const sendText = (text: string) =>
    run(async () => {
      playSend();
      pushMsg({ senderId: "me", kind: "text", text, status: "sent" });
      await sleep(250);
      setMyStatus("delivered");
      const answer = matchAnswer(text);
      setMyStatus("seen"); // Yasir "reads" it before replying
      await yasirRespond(answer ? answer.bubbles : FALLBACK, answer?.followups ?? OPENING_CHIPS);
      await maybeChime();
    });

  const sendChip = (id: string) =>
    run(async () => {
      const answer = answerById(id);
      if (!answer) return;
      playTap();
      pushMsg({ senderId: "me", kind: "text", text: answer.chip, status: "sent" });
      await sleep(250);
      setMyStatus("seen");
      await yasirRespond(answer.bubbles, answer.followups ?? OPENING_CHIPS);
      await maybeChime();
    });

  const sendGif = (url: string) => {
    if (busyRef.current) return;
    playSend();
    pushMsg({ senderId: "me", kind: "gif", gifUrl: url, status: "delivered" });
  };

  const sendFile = (file: File) => {
    if (busyRef.current) return;
    playSend();
    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    pushMsg({
      senderId: "me",
      kind: isImage ? "image" : "file",
      fileUrl: url,
      fileName: file.name,
      fileSize: fmtSize(file.size),
      status: "delivered",
    });
  };

  const invite = (id: string) =>
    run(async () => {
      const persona = botById(id);
      if (!persona) return;
      setMembers((m) => [...m, persona]);
      setShowAdd(false);
      pushMsg({ senderId: "sys", kind: "system", text: `${persona.name} ${persona.emoji} was added to the chat` });
      await sleep(350);
      for (const line of persona.greeting) await say(id, { kind: "text", text: line }, 650);
      setChips(OPENING_CHIPS);
    });

  // A client invites a real person (partner / teammate) by email: we add them
  // as a participant AND open a pre-filled email so the client can share the link.
  const inviteGuest = (info: { name: string; email: string }) =>
    run(async () => {
      const look = GUEST_LOOKS[members.filter((m) => m.role === "guest" && m.id !== "me").length % GUEST_LOOKS.length];
      const guest: Member = {
        id: `guest-${members.length}-${info.email}`,
        role: "guest",
        name: info.name,
        email: info.email,
        tagline: info.email,
        ...look,
      };
      setMembers((m) => [...m, guest]);
      setShowAdd(false);
      pushMsg({ senderId: "sys", kind: "system", text: `${info.name} was invited to the chat 👋` });

      // Open the client's email app with a ready-to-send invite + join link.
      const link = window.location.origin;
      const subject = "Join me in Yasir's Studio 💬";
      const body = [
        `Hey ${info.name},`,
        "",
        "Join me in the chat with Yasir Bashir, let's plan our project together in here:",
        link,
        "",
        "See you in there!",
      ].join("\n");
      window.location.href = `mailto:${encodeURIComponent(info.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      await sleep(350);
      await say("yasir", { kind: "text", text: `Welcome aboard, ${info.name}! 👋 Glad to have you both here, ask me anything.` }, 700);
      setChips(OPENING_CHIPS);
    });

  const react = (msgId: number, emoji: string) => {
    if (!me) return;
    setMessages((ms) =>
      ms.map((m) => {
        if (m.id !== msgId) return m;
        const r: Record<string, string[]> = { ...(m.reactions ?? {}) };
        const set = new Set(r[emoji] ?? []);
        set.has(me.id) ? set.delete(me.id) : set.add(me.id);
        if (set.size) r[emoji] = [...set];
        else delete r[emoji];
        return { ...m, reactions: r };
      }),
    );
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingId, chips]);

  // Auto-save so a visitor can pause & resume. (Admin sessions aren't persisted.)
  useEffect(() => {
    if (IS_ADMIN || phase !== "chat" || !me) return;
    saveSession({ phase, me, members, messages, chips });
    setSavedExists(true);
  }, [phase, me, members, messages, chips]);

  const typingMember = typingId ? memberById(typingId) : null;

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 -z-10 bg-cream-muted">
        <div className="absolute -top-32 -left-24 w-[460px] h-[460px] rounded-full bg-teal/25 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-gold/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
        <div className="absolute -bottom-40 left-1/3 w-[440px] h-[440px] rounded-full bg-teal-light/25 blur-3xl animate-blob" style={{ animationDelay: "8s" }} />
      </div>

      <AnimatePresence>
        {phase === "onboarding" && (
          <Onboarding
            onJoin={join}
            hasSaved={savedExists}
            onResume={resumeSaved}
            profile={profile}
            onContinue={profile ? () => join(profile) : undefined}
          />
        )}
      </AnimatePresence>

      {phase === "chat" && me && (
        <>
          <Sidebar
            members={members}
            meId={me.id}
            onAdd={() => setShowAdd(true)}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="p-3">
              <div className="glass rounded-2xl px-3 py-2.5 flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden w-9 h-9 rounded-xl hover:bg-ink/5 flex items-center justify-center text-ink"
                  aria-label="Members"
                >
                  ☰
                </button>
                <div className="leading-tight min-w-0">
                  <div className="font-display font-extrabold text-ink truncate flex items-center gap-1.5">
                    Yasir's Studio 💬
                    {IS_ADMIN && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-gold text-ink px-1.5 py-0.5 rounded-md">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-teal-dark">{members.length} members · live</div>
                </div>

                {/* Request a call */}
                <button
                  onClick={() => openPanel("book")}
                  className="ml-auto glass-teal gold-ring rounded-full pl-2.5 pr-3 h-9 flex items-center gap-1.5 text-white text-[13px] font-semibold transition-transform hover:scale-105 active:scale-95 shrink-0"
                  title="Short on time? Request a call"
                >
                  📞 <span className="hidden sm:inline">Request a call</span>
                </button>

                {/* Avatar stack */}
                <div className="hidden md:flex -space-x-2.5">
                  {members.slice(0, 5).map((m) => (
                    <div key={m.id} className="ring-2 ring-cream-muted rounded-full">
                      <Avatar emoji={m.emoji} color={m.color} size={32} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  className="glass-teal gold-ring w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-transform hover:scale-110 active:scale-90 shrink-0"
                  aria-label="Add member"
                >
                  ＋
                </button>

                {/* Your profile (sign out / switch) */}
                {me && me.id === "me" && (
                  <button
                    onClick={() => setShowProfile(true)}
                    className="shrink-0 rounded-full ring-2 ring-cream-muted transition-transform hover:scale-110 active:scale-90"
                    aria-label="Your profile"
                    title={`${me.name} · profile`}
                  >
                    <Avatar emoji={me.emoji} color={me.color} size={34} />
                  </button>
                )}
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-3">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-3 py-2">
                {messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const showDay = !!m.at && (!prev?.at || !sameDay(prev.at, m.at));
                  return (
                    <Fragment key={m.id}>
                      {showDay && (
                        <div className="flex justify-center my-2">
                          <span className="glass rounded-full px-3 py-1 text-[11px] font-semibold text-ink/50">
                            {dayLabel(m.at!)}
                          </span>
                        </div>
                      )}
                      <MessageRow
                        m={m}
                        sender={memberById(m.senderId)}
                        isMe={m.senderId === "me"}
                        onReact={(e) => react(m.id, e)}
                        onAction={openPanel}
                      />
                    </Fragment>
                  );
                })}

                {typingMember && (
                  <div className="flex gap-2.5 items-center">
                    <Avatar emoji={typingMember.emoji} color={typingMember.color} size={36} />
                    <div className="glass rounded-3xl rounded-tl-md px-4 py-3.5 flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-2 h-2 rounded-full bg-teal-dark animate-bounce-dot" style={{ animationDelay: `${i * 0.16}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </main>

            {/* Composer + chips */}
            <footer className="px-3 pb-4 pt-1">
              <div className="max-w-4xl mx-auto w-full">
                {/* Always-available client actions */}
                <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-0.5">
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.panel}
                      onClick={() => openPanel(a.panel)}
                      className="glass rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-teal-dark hover:bg-teal/10 transition active:scale-95 whitespace-nowrap shrink-0"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-2.5 min-h-[2rem]">
                  <AnimatePresence>
                    {chips.map((id) => {
                      const a = ANSWERS.find((x) => x.id === id);
                      if (!a) return null;
                      return (
                        <motion.button
                          key={id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => sendChip(id)}
                          className="glass rounded-full px-4 py-2 text-[13px] font-semibold text-teal-dark hover:bg-teal/10 transition active:scale-95"
                        >
                          {a.chip}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                </div>
                <Composer
                  onText={IS_ADMIN ? adminSay : sendText}
                  onGif={sendGif}
                  onFile={sendFile}
                  placeholder={IS_ADMIN ? "Reply as Yasir (admin)…" : undefined}
                />
              </div>
            </footer>
          </div>

          {/* Floating action buttons (right side) — labels reveal on hover */}
          <div className="fixed right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
            {[
              ...(IS_ADMIN
                ? [{ icon: "🗂", label: "Leads (admin)", onClick: () => setShowAdmin(true), danger: false }]
                : []),
              { icon: soundOn ? "🔊" : "🔇", label: soundOn ? "Sound on" : "Sound off", onClick: toggleSound, danger: false },
              { icon: "📄", label: "Save as PDF", onClick: savePdf, danger: false },
              { icon: "⏸️", label: "Pause & exit", onClick: pauseExit, danger: false },
              { icon: "🗑️", label: "Start over", onClick: startOver, danger: true },
            ].map((b) => (
              <button
                key={b.label}
                onClick={b.onClick}
                title={b.label}
                aria-label={b.label}
                className={`group relative glass w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-lg transition-transform hover:scale-110 active:scale-90 ${
                  b.danger ? "hover:bg-red-500/10" : "hover:bg-teal/10"
                }`}
              >
                {b.icon}
                <span
                  className={`absolute right-full mr-2 px-2.5 py-1 rounded-xl glass text-[12px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition ${
                    b.danger ? "text-red-500" : "text-ink"
                  }`}
                >
                  {b.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {showAdd && (
              <AddMemberModal
                presentIds={members.map((m) => m.id)}
                onInvite={invite}
                onInviteGuest={inviteGuest}
                onClose={() => setShowAdd(false)}
                isAdmin={IS_ADMIN}
              />
            )}
          </AnimatePresence>

          {/* In-chat client action popovers */}
          <AnimatePresence>
            {activePanel === "book" && <BookingPanel key="book" onClose={() => setActivePanel(null)} />}
            {activePanel === "project" && (
              <ProjectFormPanel
                key="project"
                onClose={() => setActivePanel(null)}
                defaultName={me?.name}
                defaultEmail={me?.email}
              />
            )}
            {activePanel === "portfolio" && <PortfolioPanel key="portfolio" onClose={() => setActivePanel(null)} />}
            {activePanel === "pricing" && (
              <PricingPanel key="pricing" onClose={() => setActivePanel(null)} onOpenPanel={openPanel} />
            )}
          </AnimatePresence>

          {/* Admin console (login + captured leads) */}
          <AnimatePresence>
            {showAdmin && <AdminConsole key="admin" onClose={() => setShowAdmin(false)} />}
          </AnimatePresence>

          {/* Visitor profile (sign out / switch) */}
          <AnimatePresence>
            {showProfile && me && (
              <ProfilePanel key="profile" me={me} onSignOut={signOut} onClose={() => setShowProfile(false)} />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
