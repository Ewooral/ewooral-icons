"use client";

// Grid of icon thumbnails. Each cell renders an `<img>` pointing at
// /svg/<name>.svg — the browser handles HTTP caching + native lazy
// loading so only on-screen icons actually fetch. No inline SVG content
// in the client bundle.

import { useMemo, useState } from "react";
import type { StudioIconMeta } from "./types";

type Props = {
  icons: StudioIconMeta[];
  selectedName?: string;
  onSelect: (icon: StudioIconMeta) => void;
};

export function IconGrid({ icons, selectedName, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(36);
  const [motionFilter, setMotionFilter] = useState("all");

  const allMotions = useMemo(() => {
    const set = new Set<string>();
    icons.forEach((i) => { if (i.motion) set.add(i.motion); });
    return Array.from(set).sort();
  }, [icons]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^ew-/, "");
    return icons.filter((i) => {
      if (term && !i.name.includes(term) && !i.pascal.toLowerCase().includes(term)) return false;
      if (motionFilter !== "all" && i.motion !== motionFilter) return false;
      return true;
    });
  }, [icons, query, motionFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons (e.g. heart, ew-arrow, cart)…"
          className="flex-1 min-w-[200px] bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <label className="flex items-center gap-2 label-cap">
          Size {size}
          <input
            type="range"
            min={20}
            max={80}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <label className="flex items-center gap-2 label-cap">
          Motion
          <select
            value={motionFilter}
            onChange={(e) => setMotionFilter(e.target.value)}
            className="bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-2 py-1 text-xs font-mono"
          >
            <option value="all">All</option>
            {allMotions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <span className="label-cap ml-auto">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[var(--color-ink-faint)] py-20">No icons match.</p>
      ) : (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${size + 50}px, 1fr))` }}
        >
          {filtered.map((icon) => (
            <button
              key={icon.name}
              type="button"
              onClick={() => onSelect(icon)}
              title={icon.displayName}
              className={`edge-card flex flex-col items-center gap-2 py-4 px-2 transition-colors group ${
                selectedName === icon.name
                  ? "bg-[var(--color-bg-3)] border-[var(--color-accent)]"
                  : "bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)]"
              }`}
            >
              <img
                src={`/svg/${icon.name}.svg`}
                alt=""
                width={size}
                height={size}
                loading="lazy"
                decoding="async"
              />
              <span className="text-[10px] font-mono text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-dim)] tracking-tight truncate max-w-full">
                {icon.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
