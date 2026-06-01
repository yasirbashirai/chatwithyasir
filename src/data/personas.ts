import type { Member } from "../types";

// The host — Yasir. Always in the chat. His answers come from conversation.ts.
export const HOST: Member = {
  id: "yasir",
  name: "Yasir Bashir",
  emoji: "🧑🏽‍💻",
  color: "#288672",
  role: "host",
  tagline: "Web + AI builder · host",
};

// Invitable bot personas — Yasir's "studio crew". Adding one drops them into the
// group with a greeting; they occasionally chime in with a one-liner + reaction.
export interface BotPersona extends Member {
  greeting: string[];
  quips: string[];
}

export const CREW: BotPersona[] = [
  {
    id: "sparky",
    name: "Sparky",
    emoji: "🤖",
    color: "#36C9AB",
    role: "bot",
    tagline: "Yasir's AI assistant",
    greeting: ["beep boop — Sparky online ⚡", "I'm the AI half of the studio. Ask me about automations!"],
    quips: [
      "I can wire that into a workflow 🤖",
      "Automate it. Always automate it.",
      "Adding that to the knowledge base 🧠",
      "01001000 01101001 👋",
    ],
  },
  {
    id: "pixel",
    name: "Pixel",
    emoji: "🎨",
    color: "#A855F7",
    role: "bot",
    tagline: "The designer",
    greeting: ["Pixel here 🎨", "If it's not pretty AND fast, it's not done."],
    quips: [
      "Ooh I'd give that a gold gradient ✨",
      "More whitespace. Trust me.",
      "That hero needs a liquid-glass card 😍",
      "Kerning matters, people.",
    ],
  },
  {
    id: "cash",
    name: "Cash",
    emoji: "💸",
    color: "#E2A93C",
    role: "bot",
    tagline: "Sales & growth",
    greeting: ["Cash in the chat 💸", "Let's talk conversions, baby."],
    quips: [
      "But does it CONVERT though? 📈",
      "Slap a CTA on it.",
      "That's a 3x pipeline move right there.",
      "ROI or it didn't happen 💰",
    ],
  },
  {
    id: "bolt",
    name: "Bolt",
    emoji: "⚡",
    color: "#2563EB",
    role: "bot",
    tagline: "The dev",
    greeting: ["Bolt ⚡ reporting", "React, Next, Tailwind — I ship clean."],
    quips: [
      "Shipped it. 🚀",
      "That's a one-component fix.",
      "Lighthouse score: chef's kiss 👌",
      "git commit -m 'magic'",
    ],
  },
  {
    id: "captain",
    name: "Captain",
    emoji: "🚚",
    color: "#165A4C",
    role: "bot",
    tagline: "Logistics expert",
    greeting: ["Captain on deck 🚚", "Freight, carriers, 3PL — that's my lane."],
    quips: [
      "We'd add FMCSA trust signals there 🛡️",
      "Carrier onboarding flow incoming.",
      "Revolving freight, globally, 24/7 😎",
      "That'll move loads.",
    ],
  },
];

export function botById(id: string): BotPersona | undefined {
  return CREW.find((c) => c.id === id);
}
