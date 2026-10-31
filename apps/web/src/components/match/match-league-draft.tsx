/**
 * GC-Stats - match-league-draft
 *
 * A game's draft: one row per team, in draft order. A run of bans shares its columns between the two rows: each team's
 * n-th ban is in the same column as the other team's n-th ban. A run of picks has one column per pick, so the picks are
 * staggered. A ban is greyed out and crossed by a line in the team's side colour; a pick is shown as it is. Shared by the
 * match page and the poster.
 *
 * @copyright Copyright (c) 2026 Osthelia - GC-Stats-Website
 * @license   https://github.com/Osthelia/GC-Stats-Website/blob/main/LICENSE.md Osthelia License v1.0
 * @link      https://github.com/Osthelia/GC-Stats-Website
 */

"use client";

import { LolIcon } from "@/components/match/lol-icon";
import type { LeagueGameDraft } from "@/lib/match-league-games";

type DraftStep = LeagueGameDraft["steps"][number];
/** One column of the draft: the step of each team in it, if any. */
type Column = Partial<Record<DraftStep["side"], DraftStep>>;

function BanOrPick({ step, color, size }: { step: DraftStep; color: string; size: number }) {
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

/**
 * The columns in draft order, grouped by run of the same step type. The n-th ban of each team shares column n of its run;
 * each pick is a column of its own.
 */
function draftGroups(steps: DraftStep[]): Column[][] {
  const runs: DraftStep[][] = [];
  for (const step of steps) {
    const run = runs[runs.length - 1];
    if (run && run[0]!.type === step.type) run.push(step);
    else runs.push([step]);
  }
  return runs.map((run) => {
    if (run[0]!.type === "pick") return run.map((step): Column => (step.side === "blue" ? { blue: step } : { red: step }));
    const blue = run.filter((step) => step.side === "blue");
    const red = run.filter((step) => step.side === "red");
    return Array.from({ length: Math.max(blue.length, red.length) }, (_, n): Column => ({ blue: blue[n], red: red[n] }));
  });
}

export function LeagueDraft({ draft, blueName, redName, size = 64 }: { draft: LeagueGameDraft; blueName: string; redName: string; size?: number }) {
  const teams = [
    { side: "blue" as const, name: blueName, tone: "text-blue-400", color: "#5a7cb4" },
    { side: "red" as const, name: redName, tone: "text-red-400", color: "#b65a5a" },
  ];
  const groups = draftGroups([...draft.steps].sort((x, y) => x.step - y.step));

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-800">
      {teams.map((team, i) => (
        <div key={team.side} className={`flex flex-row items-center overflow-hidden px-6 ${i === 0 ? "border-b border-neutral-800" : ""}`} style={{ background: "#111111" }}>
          <div className="w-1/5 py-3">
            <span className={`text-sm font-black tracking-wide uppercase ${team.tone}`}>{team.name}</span>
          </div>
          <div className="w-full flex flex-row justify-end">
            {groups.map((group, g) => (
              <ul key={g} className={`flex flex-row gap-0.5 ${g > 0 ? "ml-4" : ""}`}>
                {group.map((column, n) => {
                  const step = column[team.side];
                  return <li key={n}>{step ? <BanOrPick step={step} color={team.color} size={size} /> : <div style={{ width: size, height: size }} />}</li>;
                })}
              </ul>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
