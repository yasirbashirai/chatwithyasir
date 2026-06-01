import type { Bubble } from "../types";

// Yasir's scripted brain — his whole website, as a conversation.
// General brand site: who he is + ALL services + work + process + hire.
// Routed by quick-reply chip id or keyword scoring. Authentic data only.

export type Answer = {
  id: string;
  chip: string;
  keywords: string[];
  bubbles: Bubble[];
  followups?: string[];
};

// The intro — delivered as Yasir's very first message after the visitor joins.
export const BIO: Bubble[] = [
  {
    kind: "text",
    text: "Hey, welcome 👋 I'm Yasir Bashir — a web + AI builder. I design fast, premium websites and wire them to automation that actually converts.",
  },
  {
    kind: "stat",
    items: [
      { value: "5+ yrs", label: "for clients" },
      { value: "800+", label: "projects" },
      { value: "Lvl 2", label: "Fiverr seller" },
    ],
  },
  {
    kind: "text",
    text: "This is my whole studio in one chat — ask me anything, or jump straight in: see my work, check pricing, or kick off a project right here 👇",
  },
  {
    kind: "actions",
    items: [
      { label: "📅 Book a call", panel: "book" },
      { label: "🚀 Start a project", panel: "project" },
      { label: "👀 See my work", panel: "portfolio" },
      { label: "💰 Pricing", panel: "pricing" },
    ],
  },
];

export const OPENING_CHIPS = ["about", "services", "work", "pricing", "process", "hire"];
const SERVICE_CHIPS = ["web", "funnels", "automation", "chatbots", "crm", "booking", "ecommerce", "agents"];

export const ANSWERS: Answer[] = [
  // ---------- ABOUT ----------
  {
    id: "about",
    chip: "About me 👋",
    keywords: ["who", "about", "yourself", "name", "background", "story", "you"],
    bubbles: [
      {
        kind: "text",
        text: "I'm Yasir — a web + AI builder. For 5+ years I've shipped 800+ projects for clients worldwide, and I'm a Level 2 Fiverr seller.",
      },
      {
        kind: "text",
        text: "My thing: premium design + smart systems in one delivery. A site that looks the part, plus the AI & automation behind it that captures and converts leads — so it actually earns its keep.",
      },
    ],
    followups: ["services", "work", "process", "hire"],
  },

  // ---------- SERVICES OVERVIEW ----------
  {
    id: "services",
    chip: "Services 🛠️",
    keywords: ["service", "services", "do", "offer", "help", "what can", "menu"],
    bubbles: [
      { kind: "text", text: "Here's everything I build — tap any one to dig in 👇" },
      {
        kind: "services",
        items: [
          "🌐 Websites",
          "🎯 Funnels & Landing Pages",
          "⚙️ AI Automation",
          "💬 AI Chatbots",
          "📊 CRM / GoHighLevel",
          "📅 Booking Systems",
          "🛒 E-commerce",
          "🤖 AI Agents",
        ],
      },
      { kind: "text", text: "Most clients combine a few — the site and the system ship together." },
    ],
    followups: SERVICE_CHIPS,
  },

  // ---------- EACH SERVICE ----------
  {
    id: "web",
    chip: "🌐 Websites",
    keywords: ["website", "web design", "site", "landing site", "corporate site", "web"],
    bubbles: [
      {
        kind: "text",
        text: "Premium, fast, conversion-focused websites — corporate, personal brand, or product. Built in React / Next.js + Tailwind, animated where it earns it.",
      },
      { kind: "services", items: ["Responsive & fast", "SEO-ready", "Custom design", "CMS optional"] },
      { kind: "cta", label: "See website work →", href: "https://yasirbashir.com/portfolio", note: "Real builds with screenshots." },
    ],
    followups: ["funnels", "ecommerce", "hire", "services"],
  },
  {
    id: "funnels",
    chip: "🎯 Funnels",
    keywords: ["funnel", "landing page", "landing", "lead", "opt-in", "sales page"],
    bubbles: [
      {
        kind: "text",
        text: "High-converting funnels & landing pages — clear offer, one job per page, capture built in. Great for ads, launches and lead-gen.",
      },
      { kind: "services", items: ["Lead capture", "A/B-ready", "Fast load", "Tracking wired in"] },
    ],
    followups: ["automation", "crm", "hire", "services"],
  },
  {
    id: "automation",
    chip: "⚙️ AI Automation",
    keywords: ["automation", "automate", "workflow", "zapier", "make", "integrate", "smart"],
    bubbles: [
      {
        kind: "text",
        text: "I connect your tools so the busywork runs itself — lead routing, follow-ups, notifications, data sync. Smart systems that work while you sleep.",
      },
      { kind: "services", items: ["Lead → CRM sync", "Auto follow-up", "Notifications", "Tool integrations"] },
    ],
    followups: ["chatbots", "crm", "agents", "services"],
  },
  {
    id: "chatbots",
    chip: "💬 AI Chatbots",
    keywords: ["chatbot", "chat bot", "bot", "assistant", "support bot", "live chat"],
    bubbles: [
      {
        kind: "text",
        text: "Custom AI chatbots that answer questions, qualify leads and book calls — trained on your business, on-brand, 24/7. (You're literally chatting with a scripted cousin right now 😉)",
      },
      { kind: "services", items: ["Trained on your content", "Lead qualifying", "Books calls", "On-brand voice"] },
    ],
    followups: ["agents", "automation", "hire", "services"],
  },
  {
    id: "crm",
    chip: "📊 CRM / GHL",
    keywords: ["crm", "gohighlevel", "ghl", "pipeline", "high level", "highlevel"],
    bubbles: [
      {
        kind: "text",
        text: "GoHighLevel & CRM builds — pipelines, automations, email/SMS sequences, calendars and reporting, all in one place so no lead slips through.",
      },
      { kind: "services", items: ["Pipelines", "Email/SMS sequences", "Calendars", "Reporting"] },
    ],
    followups: ["automation", "booking", "hire", "services"],
  },
  {
    id: "booking",
    chip: "📅 Booking",
    keywords: ["booking", "appointment", "calendar", "schedule", "reservation"],
    bubbles: [
      {
        kind: "text",
        text: "Booking & scheduling systems — let clients self-book, get auto-reminders, and sync straight to your calendar. Fewer no-shows, zero back-and-forth.",
      },
      { kind: "services", items: ["Self-scheduling", "Auto reminders", "Calendar sync", "Payments optional"] },
    ],
    followups: ["crm", "automation", "hire", "services"],
  },
  {
    id: "ecommerce",
    chip: "🛒 E-commerce",
    keywords: ["ecommerce", "e-commerce", "shop", "store", "shopify", "woocommerce", "product"],
    bubbles: [
      {
        kind: "text",
        text: "Online stores that sell — clean product pages, fast checkout, and the automations behind the scenes (abandoned cart, post-purchase, reviews).",
      },
      { kind: "services", items: ["Product pages", "Fast checkout", "Cart recovery", "Email flows"] },
    ],
    followups: ["web", "automation", "hire", "services"],
  },
  {
    id: "agents",
    chip: "🤖 AI Agents",
    keywords: ["agent", "ai agent", "autonomous", "agentic", "claude", "gpt"],
    bubbles: [
      {
        kind: "text",
        text: "AI agents that do real work — research, draft, reply, and take multi-step actions across your tools. The next level past chatbots.",
      },
      { kind: "services", items: ["Multi-step tasks", "Tool access", "On-brand output", "Human-in-the-loop"] },
    ],
    followups: ["chatbots", "automation", "hire", "services"],
  },

  // ---------- WORK ----------
  {
    id: "work",
    chip: "My work 👀",
    keywords: ["work", "portfolio", "project", "example", "case", "built", "show", "results page"],
    bubbles: [
      { kind: "text", text: "800+ projects across many industries. A few flavors:" },
      {
        kind: "services",
        items: [
          "Personal brand & corporate sites",
          "Lead-gen funnels",
          "Freight / logistics B2B",
          "Wellness & coaching sites",
          "E-commerce & dropship stores",
          "Ops dashboards (Next.js + Prisma)",
          "AI chatbots & automations",
        ],
      },
      { kind: "text", text: "Want to flick through them right here? 👇" },
      {
        kind: "actions",
        items: [
          { label: "👀 Browse my work", panel: "portfolio" },
          { label: "🚀 Start a project", panel: "project" },
        ],
      },
      { kind: "cta", label: "See the full portfolio →", href: "https://yasirbashir.com/portfolio", note: "12 real projects with screenshots." },
    ],
    followups: ["industries", "pricing", "hire"],
  },

  // ---------- INDUSTRIES ----------
  {
    id: "industries",
    chip: "Industries 🏢",
    keywords: ["industry", "industries", "niche", "who do you work", "logistics", "freight", "clients"],
    bubbles: [
      {
        kind: "text",
        text: "I work with all kinds of businesses — coaches, agencies, e-commerce brands, local services, SaaS, and more.",
      },
      {
        kind: "text",
        text: "My deepest specialty is logistics & transport (freight brokers, carriers, 3PLs) — but the same craft applies to any brand that wants to look premium and convert.",
      },
    ],
    followups: ["work", "services", "hire"],
  },

  // ---------- PROCESS ----------
  {
    id: "process",
    chip: "How you work ⚙️",
    keywords: ["process", "how do you work", "steps", "timeline", "how long", "workflow you", "deliver"],
    bubbles: [
      { kind: "text", text: "Simple, no-drama process:" },
      {
        kind: "services",
        items: [
          "1 · Discovery — your goals & offer",
          "2 · Design — premium, on-brand",
          "3 · Build — fast & clean",
          "4 · Systems — automation & CRM",
          "5 · Launch + support",
        ],
      },
      { kind: "text", text: "Clear comms, fast turnarounds, and I don't disappear after launch." },
    ],
    followups: ["results", "hire", "services"],
  },

  // ---------- WHY ME / RESULTS ----------
  {
    id: "results",
    chip: "Why you? 📈",
    keywords: ["result", "why you", "why hire", "convert", "conversion", "roi", "growth", "outcome", "different"],
    bubbles: [
      {
        kind: "text",
        text: "Because I ship the look AND the engine. Most designers stop at pretty; most automators ignore design. I do both — so the site converts, not just impresses.",
      },
      {
        kind: "text",
        text: "And I keep it honest: I won't invent client stats. What you get is the craft, the systems, references on request — and a Level 2 track record of 800+ projects.",
      },
    ],
    followups: ["process", "work", "hire"],
  },

  // ---------- HIRE ----------
  {
    id: "hire",
    chip: "Work with me 🤝",
    keywords: ["hire", "contact", "work with", "quote", "start", "reach", "email", "book", "talk", "call", "onboard", "begin"],
    bubbles: [
      { kind: "text", text: "Let's build something 🙌 Easiest way in: book a quick call, or send me your project details right here — I'll scope it and reply within 24h." },
      {
        kind: "actions",
        items: [
          { label: "📅 Book a call", panel: "book" },
          { label: "🚀 Start a project", panel: "project" },
        ],
      },
      {
        kind: "links",
        items: [
          { label: "🌐 yasirbashir.com", href: "https://yasirbashir.com" },
          { label: "✉️ Email Yasir", href: "mailto:hello@yasirbashir.com" },
        ],
      },
    ],
    followups: ["pricing", "work", "services"],
  },

  // ---------- PRICING ----------
  {
    id: "pricing",
    chip: "Pricing 💰",
    keywords: ["price", "pricing", "cost", "how much", "package", "packages", "rate", "rates", "budget", "fee", "fees", "investment"],
    bubbles: [
      { kind: "text", text: "Two productised systems — clear scope, clear price. Custom builds are welcome too." },
      {
        kind: "stat",
        items: [
          { value: "$1,497", label: "Starter setup" },
          { value: "$2,997", label: "Growth setup" },
          { value: "30-day", label: "ROI guarantee" },
        ],
      },
      { kind: "text", text: "Tap to see what's inside each package 👇" },
      {
        kind: "actions",
        items: [
          { label: "💰 See packages", panel: "pricing" },
          { label: "📅 Book a call", panel: "book" },
        ],
      },
    ],
    followups: ["work", "services", "hire"],
  },
];

export const FALLBACK: Bubble[] = [
  {
    kind: "text",
    text: "Good one — I'm a scripted version of Yasir, best on a few topics. Pick one and I'll dig in 👇",
  },
];
