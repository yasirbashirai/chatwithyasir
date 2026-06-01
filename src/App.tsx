import { useEffect, useRef, useState } from "react";
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

export default function App() {
  const [phase, setPhase] = useState<"onboarding" | "chat">("onboarding");
  const [me, setMe] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([HOST]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);

  const idRef = useRef(0);
  const tsRef = useRef(0);
  const busyRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;
  const nextTs = () => ++tsRef.current;
  const memberById = (id: string): Member | undefined =>
    id === "me" ? me ?? undefined : members.find((m) => m.id === id);

  const pushMsg = (partial: Omit<Message, "id" | "ts">) =>
    setMessages((m) => [...m, { ...partial, id: nextId(), ts: nextTs() }]);

  // typing → push, with a human pause
  const say = async (senderId: string, partial: Omit<Message, "id" | "ts" | "senderId">, typingMs = 650) => {
    setTypingId(senderId);
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
  const join = (info: { name: string; emoji: string; color: string }) => {
    const meMember: Member = { id: "me", role: "guest", ...info };
    setMe(meMember);
    setMembers([HOST, meMember]);
    setPhase("chat");
    run(async () => {
      pushMsg({ senderId: "sys", kind: "system", text: `${info.name} joined the chat 🎉` });
      await sleep(400);
      await yasirRespond(BIO, OPENING_CHIPS);
    });
  };

  const sendText = (text: string) =>
    run(async () => {
      pushMsg({ senderId: "me", kind: "text", text });
      const answer = matchAnswer(text);
      await yasirRespond(answer ? answer.bubbles : FALLBACK, answer?.followups ?? OPENING_CHIPS);
      await maybeChime();
    });

  const sendChip = (id: string) =>
    run(async () => {
      const answer = answerById(id);
      if (!answer) return;
      pushMsg({ senderId: "me", kind: "text", text: answer.chip });
      await yasirRespond(answer.bubbles, answer.followups ?? OPENING_CHIPS);
      await maybeChime();
    });

  const sendGif = (url: string) => {
    if (busyRef.current) return;
    pushMsg({ senderId: "me", kind: "gif", gifUrl: url });
  };

  const sendFile = (file: File) => {
    if (busyRef.current) return;
    const url = URL.createObjectURL(file);
    const isImage = file.type.startsWith("image/");
    pushMsg({
      senderId: "me",
      kind: isImage ? "image" : "file",
      fileUrl: url,
      fileName: file.name,
      fileSize: fmtSize(file.size),
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
        "Join me in the chat with Yasir Bashir — let's plan our project together in here:",
        link,
        "",
        "See you in there!",
      ].join("\n");
      window.location.href = `mailto:${encodeURIComponent(info.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      await sleep(350);
      await say("yasir", { kind: "text", text: `Welcome aboard, ${info.name}! 👋 Glad to have you both here — ask me anything.` }, 700);
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
        {phase === "onboarding" && <Onboarding onJoin={join} />}
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
                  <div className="font-display font-extrabold text-ink truncate">Yasir's Studio 💬</div>
                  <div className="text-[12px] text-teal-dark">{members.length} members · live</div>
                </div>

                {/* Avatar stack */}
                <div className="ml-auto flex -space-x-2.5">
                  {members.slice(0, 5).map((m) => (
                    <div key={m.id} className="ring-2 ring-cream-muted rounded-full">
                      <Avatar emoji={m.emoji} color={m.color} size={32} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAdd(true)}
                  className="glass-teal gold-ring w-9 h-9 rounded-full flex items-center justify-center text-white text-lg transition-transform hover:scale-110 active:scale-90"
                  aria-label="Add member"
                >
                  ＋
                </button>
              </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto no-scrollbar px-3">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-3 py-2">
                {messages.map((m) => (
                  <MessageRow
                    key={m.id}
                    m={m}
                    sender={memberById(m.senderId)}
                    isMe={m.senderId === "me"}
                    onReact={(e) => react(m.id, e)}
                    onAction={setActivePanel}
                  />
                ))}

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
                      onClick={() => setActivePanel(a.panel)}
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
                <Composer onText={sendText} onGif={sendGif} onFile={sendFile} />
              </div>
            </footer>
          </div>

          <AnimatePresence>
            {showAdd && (
              <AddMemberModal
                presentIds={members.map((m) => m.id)}
                onInvite={invite}
                onInviteGuest={inviteGuest}
                onClose={() => setShowAdd(false)}
              />
            )}
          </AnimatePresence>

          {/* In-chat client action popovers */}
          <AnimatePresence>
            {activePanel === "book" && <BookingPanel key="book" onClose={() => setActivePanel(null)} />}
            {activePanel === "project" && <ProjectFormPanel key="project" onClose={() => setActivePanel(null)} />}
            {activePanel === "portfolio" && <PortfolioPanel key="portfolio" onClose={() => setActivePanel(null)} />}
            {activePanel === "pricing" && (
              <PricingPanel key="pricing" onClose={() => setActivePanel(null)} onOpenPanel={setActivePanel} />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
