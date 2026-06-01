// Real pricing tiers — mirrored from yasirbashir.com. Authentic data only.

export interface PricingTier {
  name: string;
  tagline: string;
  setupPrice: string;
  monthlyPrice: string;
  features: string[];
  highlight: boolean;
}

export const PRICING: PricingTier[] = [
  {
    name: "AI Starter System",
    tagline: "Everything you need to start booking calls on autopilot.",
    setupPrice: "$1,497",
    monthlyPrice: "$497",
    features: [
      "Conversion-engineered landing page",
      "AI chatbot (Web + WhatsApp)",
      "CRM + pipeline setup",
      "7-day automated follow-up flow",
      "Booking + payment integration",
      "Analytics dashboard",
      "30-day post-launch support",
    ],
    highlight: false,
  },
  {
    name: "Full Growth Engine",
    tagline: "The complete client-acquisition system, done for you, end to end.",
    setupPrice: "$2,997",
    monthlyPrice: "$997",
    features: [
      "Everything in Starter, plus:",
      "Multi-page custom website or web app",
      "Content + social automation system",
      "Email + SMS nurture sequences",
      "Full RevOps + reporting stack",
      "Priority support & monthly strategy call",
      "30-day ROI guarantee",
    ],
    highlight: true,
  },
];
