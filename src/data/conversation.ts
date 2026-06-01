import type { Bubble } from "../types";

// Yasir's scripted brain, written to sound like Yasir actually talking.
// Warm, first-person, no robotic phrasing, no em dashes. Authentic data only.
// Routed by quick-reply chip id or keyword scoring.

export type Answer = {
  id: string;
  chip: string;
  keywords: string[];
  bubbles: Bubble[];
  followups?: string[];
};

// The intro, delivered as Yasir's very first message after the visitor joins.
export const BIO: Bubble[] = [
  {
    kind: "text",
    text: "Hey, so glad you're here 👋 I'm Yasir. I build fast, premium websites and hook them up to automation that actually brings in clients.",
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
    text: "Think of this as my whole studio in one chat. Ask me anything, or just jump straight in below. Whatever's easiest for you 👇",
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
        text: "Sure, quick version. I'm Yasir, a web and AI builder. I've been doing this for over 5 years now, shipped 800+ projects for clients all over the world, and I'm a Level 2 seller on Fiverr.",
      },
      {
        kind: "text",
        text: "Here's what makes me different. I don't just hand you a pretty website. I build the smart stuff behind it too, the AI and automation that actually captures leads and turns them into clients. So the site earns its keep, it doesn't just sit there looking nice.",
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
      { kind: "text", text: "Happy to walk you through it. Here's everything I build, tap any one and I'll go deeper 👇" },
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
      { kind: "text", text: "Most folks end up combining a few of these. The website and the system that runs it usually ship together." },
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
        text: "Websites are my bread and butter. Fast, premium, and built to convert, whether that's a corporate site, a personal brand, or a product. I build in React, Next.js and Tailwind, with animation where it actually earns its place.",
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
        text: "Funnels and landing pages that actually convert. One clear offer, one job per page, and lead capture baked right in. They're perfect for ads, launches, and bringing in leads.",
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
        text: "This is the fun part. I connect your tools so the busywork just runs itself, lead routing, follow-ups, notifications, keeping your data in sync. Basically systems that keep working while you sleep.",
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
        text: "Custom AI chatbots that answer questions, qualify leads, and book calls for you, around the clock, trained on your business and speaking in your brand's voice. You're basically chatting with a scripted cousin of one right now 😉",
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
        text: "GoHighLevel and CRM builds. Pipelines, automations, email and SMS sequences, calendars, reporting, all living in one place so no lead ever slips through the cracks.",
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
        text: "Booking and scheduling that just works. Clients book themselves in, get auto-reminders, and it all syncs straight to your calendar. Way fewer no-shows, and zero back-and-forth emails.",
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
        text: "Online stores built to actually sell. Clean product pages, a checkout that's quick and painless, and all the quiet automations doing work in the background, abandoned cart, post-purchase, review requests.",
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
        text: "AI agents are the next step past chatbots. These actually do the work, they research, draft, reply, and take multi-step actions across your tools, with you staying in the loop wherever it matters.",
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
      { kind: "text", text: "Love showing this off 😄 I've done 800+ projects across all kinds of industries. A few of the flavors:" },
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
      { kind: "text", text: "Want to flick through some real ones right here? 👇" },
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
        text: "Honestly, all sorts. Coaches, agencies, e-commerce brands, local service businesses, SaaS, you name it.",
      },
      {
        kind: "text",
        text: "If I had to pick a specialty, it's logistics and transport, freight brokers, carriers, 3PLs. That said, the same craft works for any brand that wants to look premium and actually convert.",
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
      { kind: "text", text: "Nice and simple, no drama. It goes like this:" },
      {
        kind: "services",
        items: [
          "1 · Discovery: your goals & offer",
          "2 · Design: premium, on-brand",
          "3 · Build: fast & clean",
          "4 · Systems: automation & CRM",
          "5 · Launch + support",
        ],
      },
      { kind: "text", text: "You'll always know where things stand, turnarounds are quick, and I don't vanish on you after launch." },
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
        text: "Fair question. It's because I ship the look AND the engine. Most designers stop at pretty, and most automation folks ignore design. I do both, so your site actually converts, it doesn't just impress people.",
      },
      {
        kind: "text",
        text: "And I'll always keep it straight with you. I won't make up client stats to sound impressive. What you get is the craft, the systems, references whenever you want them, and a Level 2 track record of 800+ projects behind me.",
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
      { kind: "text", text: "Let's build something good together 🙌 Easiest way in is to grab a quick call, or just drop me your project details right here. I'll scope it out and get back to you within 24 hours." },
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
      { kind: "text", text: "Straight to the point, I like it 😅 I've got two ready-made systems with clear scope and clear pricing, and I'm always up for a custom build too." },
      {
        kind: "stat",
        items: [
          { value: "$1,497", label: "Starter setup" },
          { value: "$2,997", label: "Growth setup" },
          { value: "30-day", label: "ROI guarantee" },
        ],
      },
      { kind: "text", text: "Have a look at what's inside each one 👇" },
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
    text: "Ha, good one. I'm a scripted version of Yasir, so I'm best on a handful of topics. Pick one below and I'll dig right in 👇",
  },
];
