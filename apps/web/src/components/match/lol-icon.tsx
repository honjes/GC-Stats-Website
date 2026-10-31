/**
 * GC-Stats - lol-icon
 *
 * A League icon from the public bucket: a champion, an item or a rune. Styled like AgentIcon: a thin border on the surface
 * colour, lazy loading, and the name as tooltip. A champion's artwork has a dark frame baked in, so it is cropped to hide
 * that frame and gets no border of its own. Runes are round. An icon that is not stored yet (or fails to load) shows a
 * tile with the name's first letter instead.
 *
 * @copyright Copyright (c) 2026 Osthelia - GC-Stats-Website
 * @license   https://github.com/Osthelia/GC-Stats-Website/blob/main/LICENSE.md Osthelia License v1.0
 * @link      https://github.com/Osthelia/GC-Stats-Website
 */

"use client";

import { useState } from "react";

type Props = {
  kind: "champion" | "item" | "rune";
  url: string | null;
  /** The champion, item or rune name: the alt text and the tooltip. Decorative icons pass none. */
  name?: string;
  size: number;
};

export function LolIcon({ kind, url, name = "", size }: Props) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };
  const shape = kind === "rune" ? "rounded-full" : "rounded-sm";

  if (url === null || failed) {
    return (
      <span
        role="img"
        aria-label={name}
        aria-hidden={!name}
        title={name}
        style={style}
        className={`flex flex-none items-center justify-center border border-neutral-800 bg-(--gcs-surface-2) text-[8px] font-black text-neutral-500 uppercase ${shape}`}
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  const champion = kind === "champion";
  return (
    <img
      src={url}
      alt={name}
      title={name}
      loading="lazy"
      width={size}
      height={size}
      style={{...style, clipPath: champion ? "inset(6% round 4px)" : ""}}
      className={champion ? "flex-none object-cover" : `flex-none border border-neutral-800 bg-(--gcs-surface-2) object-cover ${shape}`}
      onError={() => setFailed(true)}
    />
  );
}
