// Vercel serverless function — live AI chat for "Chat With Yasir".
//
// The Gemini API key lives ONLY in this server-side env var (GEMINI_API_KEY),
// so it never ships to the browser. The model is grounded on Yasir's real data
// (the KNOWLEDGE block below) and told to answer only from it, in Yasir's voice.
//
// Env vars (set in Vercel → Project → Settings → Environment Variables):
//   GEMINI_API_KEY   (required)  — your free key from aistudio.google.com
//   GEMINI_MODEL     (optional)  — defaults to "gemini-2.0-flash"

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

// ---- Grounding: Yasir's real, authentic data (mirrors the site content) ----
const KNOWLEDGE = `
ABOUT YASIR
- Yasir Bashir — AI Engineer, web & AI builder. 5+ years, 800+ projects delivered for clients worldwide. Level 2 seller on Fiverr.
- He builds fast, premium websites AND the AI + automation behind them that captures leads and turns them into clients (the site earns its keep, it doesn't just look nice).
- Tech: React, Next.js, Tailwind. Automation with n8n, Zapier/Make, GoHighLevel. Custom AI chatbots and agents.
- Strong niche in US logistics (freight brokers, trucking, transport), plus founders, agencies, service businesses and wellness brands.

SERVICES
- Websites: fast, premium, conversion-focused (corporate, personal brand, product). React/Next/Tailwind, responsive, SEO-ready, optional CMS.
- Funnels & landing pages: one clear offer per page, lead capture baked in, A/B-ready, tracking wired in.
- AI Automation: lead routing, auto follow-ups, notifications, keeping tools/data in sync — systems that keep working while you sleep.
- AI Chatbots: trained on your business, speak in your brand voice, qualify leads and book calls 24/7 (web + WhatsApp).
- CRM / GoHighLevel: pipelines, email/SMS sequences, calendars, reporting — so no lead slips through.
- Booking systems: self-scheduling, auto reminders, calendar sync, optional payments.
- Also E-commerce and AI Agents. Most clients combine a few; the website and the system that runs it usually ship together.

PRICING (from yasirbashir.com — setup + monthly)
- AI Starter System: $1,497 setup + $497/mo. Conversion landing page, AI chatbot (web + WhatsApp), CRM + pipeline, 7-day automated follow-up, booking + payments, analytics dashboard, 30-day support.
- Full Growth Engine (most popular): $2,997 setup + $997/mo. Everything in Starter, plus a multi-page custom website or web app, content + social automation, email + SMS nurture, full RevOps + reporting, priority support + monthly strategy call, 30-day ROI guarantee.
- Custom scopes are possible. For an exact quote, it's best to book a quick call.

SELECTED REAL WORK
- RMG Transport (rmgtransport.com): AI lead system for a nationwide US transport company — 40% more leads, 60% less manual work, 3x faster booking.
- Steer Logistics (steerlogistics.co): full freight brokerage web platform, launched in ~2 weeks.
- Dominique McClaney (dominiquemcclaney.com): AI-powered personal site + 24/7 chatbot for a full-stack engineer & Navy veteran.
- TruckinLink (truckinlink.com): digital marketing + driver recruitment for US trucking.
- Elevated Financial (elevatedfinancialllc.com): credit repair + business funding firm — $1M+ funding approved, 4.95 rating.
- More freight/logistics sites: FWL Logistics, SFam Logistics (with admin dashboard), Earth Logistics (15 pages), Arnold Freight Group.
- Service & wellness sites: SC Commercial Concepts, Sublime Pathways, Love & Care Retreat (bilingual EN/RO).
- Full portfolio with screenshots: https://yasirbashir.com/portfolio

LEARN WITH YASIR (free learning platform — for people who want to LEARN, not hire)
- Besides done-for-you services, Yasir runs "Learn With Yasir", a free, project-first learning platform at https://learnwith.yasirbashir.com
- It teaches the exact skills Yasir uses: AI automation (n8n), AI chatbots, GoHighLevel/CRM, web apps, WordPress, funnels, e-commerce, social media + YouTube automation, AI video, and more. 34 hands-on courses.
- Format: one month per skill, real projects (not just theory), and a clear path from learning to landing real clients.
- 7 guided learning paths to follow in order: AI Automation Pro, Web & App Builder, Growth & Funnels, Start an Agency, AI Creator Studio, 3D & Game Builder, and AI-Era Growth.
- Not sure where to start? There's a free "Find your skill" quiz that recommends the right skill and path.
- Courses are FREE. Sign up to track progress, unlock modules, and earn a certificate on completion.
- Who it's for: students, beginners, freelancers, career-switchers, anyone who wants to learn AI/web/automation skills and earn from them.
- Get started: https://learnwith.yasirbashir.com (browse courses, pick a path, or take the quiz).

CONTACT / NEXT STEPS
- Book a 30-min call: https://cal.com/yasir-bashir-bp4wob/30min
- WhatsApp: https://wa.me/923446012505
- Email: hello@yasirbashir.com
- Main site: https://yasirbashir.com
- Inside this chat the visitor can also tap: Book a call, Start a project, Portfolio, Pricing.
`.trim();

const SYSTEM_PROMPT = `You are Yasir Bashir's friendly studio assistant, chatting on his behalf inside his portfolio chat. You speak in the FIRST PERSON as Yasir ("I build...", "I can help you...").

VOICE & STYLE
- Warm, casual, confident, human. Like Yasir actually texting a potential client.
- Keep replies short and chat-sized: 1 to 3 short sentences or a tiny list. This is a chat bubble, not an essay.
- Do NOT use em dashes. Use plain commas or periods. Emojis are fine but sparing (at most one).
- No markdown headings or bold. Plain text only.

TWO KINDS OF VISITORS — read what they want and help accordingly:
1) CLIENTS who want Yasir to BUILD something for them (a website, automation, chatbot, etc.). Help with services, pricing, portfolio and process, and when it fits, nudge them to book a call or start a project.
2) LEARNERS / STUDENTS who want to LEARN a skill themselves. Point them to "Learn With Yasir" (free, project-first courses at https://learnwith.yasirbashir.com). Suggest the free "Find your skill" quiz, or a relevant course or learning path, and be warm and encouraging.
Some visitors are both, or unsure. If it's genuinely unclear, it's fine to ask one short friendly question (e.g. "are you looking to have this built for you, or to learn it yourself?"). Never hard-sell paid services to someone who clearly just wants to learn.

GROUNDING (very important)
- Only use the facts in the KNOWLEDGE below. This is authentic data — never invent prices, stats, projects, timelines, course names or claims.
- If you don't know something or it isn't in the knowledge (exact custom quotes, availability, anything personal), say so briefly and offer to book a quick call or share the right link. Never make things up.

SCOPE
- Stay on topic: Yasir, his services, his work and pricing, his free learning platform (Learn With Yasir), and how he can help the visitor either as a client or a learner.
- If asked something clearly off-topic or inappropriate, gently steer back to how Yasir can help.

KNOWLEDGE:
${KNOWLEDGE}`;

// ---- Origin allowlist: only Yasir's own sites may call this endpoint, so a
// random site can't embed it and burn the Gemini quota. Extra origins can be
// added via the ALLOWED_ORIGINS env var (comma-separated).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://chatwith.yasirbashir.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    // localhost for dev, and this project's own Vercel preview deploys.
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".vercel.app") && host.includes("chatwithyasir")) return true;
  } catch {
    /* malformed origin */
  }
  return false;
}

// ---- Best-effort, per-instance rate limit (light abuse guard) ----
const HITS = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
function rateLimited(ip) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (HITS.size > 5000) for (const [k, v] of HITS) if (!v.some((t) => now - t < WINDOW_MS)) HITS.delete(k);
  return arr.length > MAX_PER_WINDOW;
}

function setCors(res, origin) {
  // Reflect the origin only if it's allowed; otherwise pin to the primary site
  // so disallowed browsers get blocked by CORS.
  res.setHeader("Access-Control-Allow-Origin", isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0]);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  const origin = (req.headers.origin || "").toString();

  if (req.method === "OPTIONS") {
    setCors(res, origin);
    return res.status(204).end();
  }
  setCors(res, origin);

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // Only Yasir's own sites may use this endpoint (protects the Gemini quota).
  if (!isAllowedOrigin(origin)) return res.status(403).json({ error: "Forbidden" });
  if (!API_KEY) return res.status(503).json({ error: "AI not configured" });

  const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || "anon";
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many requests, please slow down." });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // Sanitize + cap conversation history.
  const raw = Array.isArray(body?.messages) ? body.messages : [];
  const messages = raw
    .slice(-12)
    .map((m) => ({
      role: m?.role === "model" || m?.role === "assistant" ? "model" : "user",
      text: String(m?.text || "").slice(0, 2000),
    }))
    .filter((m) => m.text);

  if (!messages.length) return res.status(400).json({ error: "No message provided" });

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 600,
      // Disable 2.5-flash "thinking" so replies are fast and don't spend the
      // output budget on reasoning tokens (harmless on models without it).
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    );
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("Gemini error", r.status, JSON.stringify(data).slice(0, 500));
      return res.status(502).json({ error: "AI upstream error" });
    }
    const reply = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p?.text || "")
      .join("")
      .trim();
    if (!reply) return res.status(502).json({ error: "Empty reply" });
    return res.status(200).json({ reply });
  } catch (e) {
    console.error("AI request failed", e);
    return res.status(502).json({ error: "AI request failed" });
  }
}
