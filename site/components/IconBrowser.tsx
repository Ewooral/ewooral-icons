"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { InlineIcon } from "./InlineIcon";

type BrowserIcon = {
  name: string;
  displayName: string;
  pascal: string;
  motion: string | null;
  svg: string;
};

export function IconBrowser({ icons }: { icons: BrowserIcon[] }) {
  const [q, setQ] = useState("");
  const [size, setSize] = useState(36);
  const [motion, setMotion] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase().replace(/^ew-/, "");
    return icons.filter((i) => {
      if (term && !i.name.includes(term) && !i.pascal.toLowerCase().includes(term)) return false;
      if (motion !== "all" && i.motion !== motion) return false;
      return true;
    });
  }, [icons, q, motion]);

  const allMotions = useMemo(() => {
    const set = new Set<string>();
    icons.forEach((i) => { if (i.motion) set.add(i.motion); });
    return Array.from(set).sort();
  }, [icons]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search icons (e.g. heart, ew-arrow, cart)…"
          className="flex-1 min-w-[240px] bg-[var(--color-bg)] border border-[var(--color-line)] rounded px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <label className="flex items-center gap-2 label-cap">
          Size {size}
          <input type="range" min={20} max={80} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label className="flex items-center gap-2 label-cap">
          Motion
          <select
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
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
            <Link
              key={icon.name}
              href={`/icons/${icon.name}`}
              className="edge-card flex flex-col items-center gap-2 py-4 px-2 bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)] transition-colors group"
            >
              <InlineIcon svg={icon.svg} size={size} />
              <span className="text-[10px] font-mono text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-dim)] tracking-tight truncate max-w-full">
                {icon.displayName}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
