import { useState } from "react";
import { Panel } from "./Panel";
import { CONTACT_EMAIL } from "../data/config";

/**
 * ProjectFormPanel — the core onboarding action. A client describes their
 * project; on submit we open a pre-filled email to Yasir (no backend needed).
 * Cal.com handles calls; this handles "let's start a project" inquiries.
 */

const PROJECT_TYPES = [
  "Website",
  "Funnel / Landing page",
  "AI Automation",
  "AI Chatbot",
  "CRM / GoHighLevel",
  "Booking system",
  "E-commerce store",
  "AI Agent",
  "Not sure yet",
];

const BUDGETS = ["Under $1k", "$1k – $3k", "$3k – $5k", "$5k – $10k", "$10k+", "Let's discuss"];

const field = "w-full glass rounded-2xl px-4 py-2.5 text-[15px] text-ink outline-none focus:ring-2 focus:ring-teal/40 transition";

export function ProjectFormPanel({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const [budget, setBudget] = useState(BUDGETS[1]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email);

  const submit = () => {
    if (!valid) return;
    const subject = `New project inquiry — ${name} (${type})`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Project type: ${type}`,
      `Budget: ${budget}`,
      "",
      "Details:",
      message || "(none provided)",
      "",
      "— Sent from Yasir's Studio chat",
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  if (sent) {
    return (
      <Panel emoji="🎉" title="Inquiry ready to send" onClose={onClose} maxWidth="max-w-md">
        <div className="text-center py-4">
          <p className="text-[15px] text-ink leading-relaxed">
            Your email just opened, pre-filled — hit <b>send</b> and Yasir will get back to you,
            usually within 24 hours. Excited to build with you! 🚀
          </p>
          <button
            onClick={onClose}
            className="glass-teal gold-ring mt-5 rounded-2xl px-5 py-2.5 text-white font-display font-bold transition-transform hover:scale-[1.02] active:scale-95"
          >
            Back to chat
          </button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      emoji="🚀"
      title="Start a project"
      subtitle="Tell Yasir what you're building — he'll scope it and reply within 24h."
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <button
          onClick={submit}
          disabled={!valid}
          className="w-full glass-teal gold-ring rounded-2xl py-3 text-white font-display font-bold transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          Send inquiry →
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[13px] font-semibold text-ink/60 ml-1">Your name</label>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="text-[13px] font-semibold text-ink/60 ml-1">Email</label>
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-semibold text-ink/60 ml-1">Project</label>
            <select className={field} value={type} onChange={(e) => setType(e.target.value)}>
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-semibold text-ink/60 ml-1">Budget</label>
            <select className={field} value={budget} onChange={(e) => setBudget(e.target.value)}>
              {BUDGETS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[13px] font-semibold text-ink/60 ml-1">Anything else?</label>
          <textarea
            className={`${field} resize-none`}
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Goals, timeline, links…"
          />
        </div>
      </div>
    </Panel>
  );
}
