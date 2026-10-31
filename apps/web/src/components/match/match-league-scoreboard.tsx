/**
 * GC-Stats - match-league-scoreboard
 *
 * The LoL scoreboard. Every row is full width and each team takes half of it: the player on the outside, the build
 * (champion, runes and items) next to it, the stats towards the centre line. A game also shows its objectives under
 * the header. Used for one game or for the averages over the series, on the match page and on the match poster: the
 * layout and colours are the same, the look (sizes, links, scrolling) comes from LOOKS.
 *
 * @copyright Copyright (c) 2026 Osthelia - GC-Stats-Website
 * @license   https://github.com/Osthelia/GC-Stats-Website/blob/main/LICENSE.md Osthelia License v1.0
 * @link      https://github.com/Osthelia/GC-Stats-Website
 */

"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { LolIcon } from "@/components/match/lol-icon";
import { LolObjectiveStrip } from "@/components/match/lol-objective-strip";
import { Link } from "@/i18n/navigation";
import { slugify } from "@/lib/entity-id";
import { formatGameDuration, type LeagueScoreRow } from "@/lib/league-scoreboard";
import type { LeagueGameObjectives } from "@/lib/match-league-games";

const LOOKS = {
  page: {
    grid: { left: "150px minmax(120px,1fr) 88px 48px 56px 64px", right: "64px 56px 48px 88px minmax(120px,1fr) 150px" },
    text: "text-[13px]",
    pad: "gap-2 px-3 py-2.5",
    icons: { champion: 44, small: 22, objective: 22 },
    interactive: true,
  },
  poster: {
    grid: { left: "200px minmax(0,1fr) 140px 80px 100px 110px", right: "110px 100px 80px 140px minmax(0,1fr) 200px" },
    text: "text-[19px]",
    pad: "gap-x-3 px-6 py-3",
    icons: { champion: 64, small: 32, objective: 32 },
    interactive: false,
  },
} as const;

export type ScoreboardLook = keyof typeof LOOKS;
type Look = (typeof LOOKS)[ScoreboardLook];
type Side = "left" | "right";

const STAT = "text-center tabular-nums text-neutral-300";

/** K/D/A, KP, CS/min and Gold/min of one player, left to right. The right side reverses them. */
function StatCells({ row, reverse = false }: { row: LeagueScoreRow | null; reverse?: boolean }) {
  if (!row) {
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} aria-hidden />
        ))}
      </>
    );
  }
  const stats = [
    <div key="kda" className={`${STAT} whitespace-nowrap`}>
      <span className="font-black text-(--gcs-text)">{row.kills}</span>
      <span className="mx-0.5 text-neutral-600">/</span>
      <span className="font-black text-red-500/70">{row.deaths}</span>
      <span className="mx-0.5 text-neutral-600">/</span>
      <span className="font-black text-neutral-400">{row.assists}</span>
    </div>,
    <div key="kp" className={STAT}>
      {Math.round(row.killParticipation)}%
    </div>,
    <div key="cs" className={STAT}>
      {row.csPerMinute === null ? "–" : row.csPerMinute.toFixed(1)}
    </div>,
    <div key="gpm" className={STAT}>
      {row.goldPerMinute === null ? "–" : Math.round(row.goldPerMinute)}
    </div>,
  ];
  return <>{reverse ? [...stats].reverse() : stats}</>;
}

/** The player's name, linked to the player page when the look is interactive and the player is mapped. Long names end in an ellipsis; the full name is the tooltip. */
function PlayerName({ row, side, look }: { row: LeagueScoreRow | null; side: Side; look: Look }) {
  if (!row) return <div />;
  const hover = look.interactive ? "transition-colors hover:text-[#e4ae22]" : "";
  const className = `block min-w-0 truncate font-black uppercase italic ${hover} ${side === "right" ? "pr-1 text-right" : ""}`;
  if (!look.interactive || row.personId == null) return <div className={className} title={row.handle}>{row.handle}</div>;
  return (
    <Link href={`/player/${row.personId}/${slugify(row.handle)}`} className={className} title={row.handle}>
      {row.handle}
    </Link>
  );
}

/**
 * The champion, the runes and the items of one player in one column: the champion next to the runes, the items after
 * them. The right side reverses the order, so the champion sits next to the player name on both sides.
 */
function ChampionBuild({ row, side, look }: { row: LeagueScoreRow | null; side: Side; look: Look }) {
  if (!row) return <div />;
  const { champion: championSize, small } = look.icons;
  const champions = row.champions.map((champion) => (
    <LolIcon key={`champion-${champion.name}`} kind="champion" url={champion.iconUrl} name={champion.name} size={championSize} />
  ));
  const runeIcons = row.runes
    ? [
        <LolIcon key="keystone" kind="rune" url={row.runes.keystoneIconUrl} name={row.runes.keystoneName ?? ""} size={small} />,
        <LolIcon key="secondary" kind="rune" url={row.runes.secondaryIconUrl} name={row.runes.secondaryName ?? ""} size={small} />,
      ]
    : [];
  const itemIcons = (row.items ?? []).map((item, i) => <LolIcon key={`item-${i}`} kind="item" url={item.iconUrl} name={item.name} size={small} />);
  const trinket = itemIcons.pop();
  const runes = <div className="flex flex-col">{runeIcons}</div>;
  const items = <div className="grid grid-cols-3">{itemIcons}</div>;

  return side === "left" ? (
    <div className="flex flex-wrap items-center gap-1.5">
      {champions}
      {runes}
      {items}
      {trinket}
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {trinket}
      {items}
      {runes}
      {champions}
    </div>
  );
}

/** One team's half of a row. */
function ScoreHalf({ row, side, look, className = "" }: { row: LeagueScoreRow | null; side: Side; look: Look; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`grid items-center ${look.pad}`} style={{ gridTemplateColumns: look.grid[side] }}>
        {side === "left" ? (
          <>
            <PlayerName row={row} side={side} look={look} />
            <ChampionBuild row={row} side={side} look={look} />
            <StatCells row={row} />
          </>
        ) : (
          <>
            <StatCells row={row} reverse />
            <ChampionBuild row={row} side={side} look={look} />
            <PlayerName row={row} side={side} look={look} />
          </>
        )}
      </div>
    </div>
  );
}

function ColumnLabels({ side, look, className = "" }: { side: Side; look: Look; className?: string }) {
  const t = useTranslations("matchPage");
  // Same order as the cells in ScoreHalf: player, build (no title), then the stats.
  const labels = [
    <div key="player" className={side === "right" ? "pr-1 text-right" : ""}>{t("colPlayer")}</div>,
    <div key="build" aria-hidden />,
    <div key="kda" className="text-center">K/D/A</div>,
    <div key="kp" className="text-center">KP</div>,
    <div key="cs" className="text-center">CS/min</div>,
    <div key="gpm" className="text-center">Gold/min</div>,
  ];
  // The right half mirrors the left, so its columns read from the centre outwards.
  const ordered = side === "left" ? labels : [...labels].reverse();
  return (
    <div className={`grid min-w-0 items-center text-[0.75em] font-black tracking-wide text-neutral-500 uppercase ${look.pad} ${className}`} style={{ gridTemplateColumns: look.grid[side] }}>
      {ordered}
    </div>
  );
}

export function LeagueScoreboard({
  header,
  rowsA,
  rowsB,
  objectivesA,
  objectivesB,
  durationSeconds,
  look: lookName = "page",
}: {
  /** The team names above the rows: MatchScoreboardHeader on the page, a plain name bar on the poster. */
  header: ReactNode;
  rowsA: LeagueScoreRow[];
  rowsB: LeagueScoreRow[];
  /** A game's objectives, shown under the header. Left out for the averages. */
  objectivesA?: LeagueGameObjectives;
  objectivesB?: LeagueGameObjectives;
  /** Shown between the two objective strips. */
  durationSeconds?: number | null;
  look?: ScoreboardLook;
}) {
  const t = useTranslations("matchPage");
  const look = LOOKS[lookName];
  const rowCount = Math.max(rowsA.length, rowsB.length);
  const showObjectives = objectivesA !== undefined || objectivesB !== undefined;

  const body = (
    <>
      {showObjectives && (
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center border-b border-neutral-800 ${look.pad}`}>
          <LolObjectiveStrip objectives={objectivesA} tone="text-blue-400" size={look.icons.objective} />
          <div className="px-2 text-center font-mono text-[0.9em] whitespace-nowrap text-neutral-400">
            {durationSeconds != null && (
              <>
                {t("duration")} <span className="text-neutral-200">{formatGameDuration(durationSeconds)}</span>
              </>
            )}
          </div>
          <LolObjectiveStrip objectives={objectivesB} tone="text-red-400" size={look.icons.objective} mirrored />
        </div>
      )}

      <div className="grid grid-cols-2 border-b border-neutral-800">
        <ColumnLabels side="left" look={look} />
        <ColumnLabels side="right" look={look} className="border-l border-neutral-800" />
      </div>

      <div className="divide-y divide-neutral-900">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className={`grid grid-cols-2 ${look.interactive ? "transition-colors hover:bg-white/6" : ""} ${i % 2 === 1 ? "bg-white/2" : ""}`}>
            <ScoreHalf row={rowsA[i] ?? null} side="left" look={look} />
            <ScoreHalf row={rowsB[i] ?? null} side="right" look={look} className="border-l border-white/5" />
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-neutral-800 bg-(--gcs-surface-2) ${look.text}`}>
      {header}
      {rowCount === 0 ? (
        <p className="px-4 py-6 text-center text-neutral-400">{t("noGameData")}</p>
      ) : look.interactive ? (
        <div className="no-scrollbar w-full overflow-x-auto">
          <div className="min-w-7xl">{body}</div>
        </div>
      ) : (
        body
      )}
    </div>
  );
}
