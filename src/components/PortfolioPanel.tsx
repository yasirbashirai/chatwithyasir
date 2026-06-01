import { useMemo, useState } from "react";
import { Panel } from "./Panel";
import { PROJECTS } from "../data/portfolio";
import { MAIN_SITE_PORTFOLIO } from "../data/config";

/**
 * PortfolioPanel — Yasir's real work, browsable inside the chat. Filter by
 * category; each card links to the live site. Full case studies live on the
 * main site (linked in the footer).
 */
export function PortfolioPanel({ onClose }: { onClose: () => void }) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    PROJECTS.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return ["All", ...[...set].sort()];
  }, []);

  const [active, setActive] = useState("All");
  const shown = active === "All" ? PROJECTS : PROJECTS.filter((p) => p.categories.includes(active));

  return (
    <Panel
      emoji="👀"
      title="Yasir's work"
      subtitle={`${PROJECTS.length} real builds, tap any to visit it live.`}
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <a
          href={MAIN_SITE_PORTFOLIO}
          target="_blank"
          rel="noreferrer"
          className="block text-center font-semibold text-teal-dark hover:text-teal transition text-sm"
        >
          See full case studies on yasirbashir.com ↗
        </a>
      }
    >
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-4 sticky top-0">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition active:scale-95 ${
              active === c ? "glass-teal text-white" : "glass text-teal-dark hover:bg-teal/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shown.map((p) => (
          <a
            key={p.title}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="glass rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform active:scale-95 group"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-teal/10">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3.5 flex flex-col gap-2 flex-1">
              <div>
                <div className="font-display font-bold text-ink text-[15px] leading-tight">
                  {p.emoji} {p.title}
                </div>
                <div className="text-[12px] text-ink/55">{p.subtitle}</div>
              </div>
              <p className="text-[13px] text-ink/75 leading-snug">{p.headline}</p>
              <div className="flex gap-3 mt-auto pt-1">
                {p.stats.slice(0, 3).map((s) => (
                  <div key={s.label}>
                    <div className="font-display font-extrabold text-teal-dark text-[15px] leading-none">{s.value}</div>
                    <div className="text-[10px] text-ink/50 leading-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </Panel>
  );
}
