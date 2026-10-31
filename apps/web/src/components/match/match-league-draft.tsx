/**
 * GC-Stats - match-league-draft
 *
 * A game's draft: one row per team with its steps in order. A ban is greyed out and crossed by a line in the team's
 * side colour; a pick is shown as it is. Shared by the match page and the poster.
 *
 * @copyright Copyright (c) 2026 Osthelia - GC-Stats-Website
 * @license   https://github.com/Osthelia/GC-Stats-Website/blob/main/LICENSE.md Osthelia License v1.0
 * @link      https://github.com/Osthelia/GC-Stats-Website
 */

"use client";

import { LolIcon } from "@/components/match/lol-icon";
import type { LeagueGameDraft } from "@/lib/match-league-games";

const BLUE = "#5a7cb4";
const RED = "#b65a5a";

function BanOrPick({ step, color, size }: { step: LeagueGameDraft["steps"][number]; color: string; size: number }) {
  const ban = step.type === "ban";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className={ban ? "grayscale opacity-60" : ""}>
        <LolIcon kind="champion" url={step.iconUrl} name={step.championName} size={size} />
      </div>
      {ban && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 64 64" preserveAspectRatio="none" aria-hidden="true">
          <line x1="10" y1="54" x2="54" y2="10" stroke={color} strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

export function LeagueDraft({ draft, blueName, redName, size = 64 }: { draft: LeagueGameDraft; blueName: string; redName: string; size?: number }) {
  const columns = [
    { side: "blue" as const, name: blueName, tone: "text-blue-400", color: BLUE },
    { side: "red" as const, name: redName, tone: "text-red-400", color: RED },
  ];

  return (
    <section className="flex flex-col rounded-2xl  border-neutral-800 border">
      {columns.map((column, i) => {
        return (
          <div key={column.side} className={`overflow-hidden flex flex-row items-center ${i === 0 && 'border-neutral-800 border-b'}`} style={{ background: "#111111" }}>
            <div className="px-6 py-3 w-1/5 h-fill">
              <span className={`text-sm font-black tracking-wide uppercase ${column.tone}`}>{column.name}</span>
            </div>
            <ul className="flex flex-row gap-0.5 divide-y divide-white/5">
              {draft.steps.map((s) => (
                <li key={s.step}>
                  {s.side === column.side ? (
                    <BanOrPick step={s} color={column.color} size={size} />
                  ) : s.type !== "ban" ? (
                    <div style={{ width: size }}></div>
                  ) : (
                    ""
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
