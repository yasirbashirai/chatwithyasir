import { Panel } from "./Panel";
import { PRICING } from "../data/pricing";
import type { PanelId } from "../types";

/**
 * PricingPanel — Yasir's real productised packages. CTAs open the booking
 * popover so a client can go straight from "this fits" to "let's talk".
 * Custom scopes are still welcome (noted at the bottom).
 */
export function PricingPanel({
  onClose,
  onOpenPanel,
}: {
  onClose: () => void;
  onOpenPanel: (p: PanelId) => void;
}) {
  return (
    <Panel
      emoji="💰"
      title="Packages"
      subtitle="Productised systems with clear scope. Custom builds welcome too."
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={() => onOpenPanel("project")}
          className="block w-full text-center font-semibold text-teal-dark hover:text-teal transition text-sm"
        >
          Need something custom? Start a project →
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRICING.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-4 flex flex-col relative ${
              tier.highlight ? "glass-teal text-white gold-ring" : "glass text-ink"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-2 right-4 bg-gold text-ink text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                Most popular
              </span>
            )}
            <div className="font-display font-extrabold text-lg leading-tight">{tier.name}</div>
            <p className={`text-[13px] mt-1 ${tier.highlight ? "text-white/85" : "text-ink/60"}`}>{tier.tagline}</p>

            <div className="flex items-end gap-1 mt-3">
              <span className="font-display font-extrabold text-2xl">{tier.setupPrice}</span>
              <span className={`text-[13px] mb-0.5 ${tier.highlight ? "text-white/75" : "text-ink/55"}`}>setup</span>
            </div>
            <div className={`text-[13px] ${tier.highlight ? "text-white/75" : "text-ink/55"}`}>
              + {tier.monthlyPrice}/mo
            </div>

            <ul className="flex flex-col gap-1.5 mt-3 mb-4">
              {tier.features.map((f) => (
                <li key={f} className="flex gap-2 text-[13px] leading-snug">
                  <span className={tier.highlight ? "text-gold-light" : "text-teal"}>✓</span>
                  <span className={tier.highlight ? "text-white/90" : "text-ink/80"}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onOpenPanel("book")}
              className={`mt-auto rounded-2xl py-2.5 font-display font-bold text-[14px] transition-transform hover:scale-[1.02] active:scale-95 ${
                tier.highlight ? "bg-white text-teal-dark" : "glass-teal gold-ring text-white"
              }`}
            >
              Book a strategy call
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
