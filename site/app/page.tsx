import Link from "next/link";
import { loadIcons } from "../lib/icons";
import { InlineIcon } from "../components/InlineIcon";

export default function HomePage() {
  const icons = loadIcons();
  const FEATURED = ["heart", "scissors", "bell", "star", "sparkle", "calendar", "camera", "cart",
                    "send", "gift", "hair-dryer", "lipstick", "share", "wallet", "user", "settings"];
  const featured = FEATURED.map((n) => icons.find((i) => i.name === n)!).filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="grid md:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <p className="label-cap mb-5">
              v0.1 · {icons.length} icons · MIT
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6"
                style={{ fontFamily: "var(--font-display)" }}>
              Icons with the{" "}
              <span className="text-[var(--color-accent)]">Ewooral</span>{" "}
              stamp on them.
            </h1>
            <p className="text-lg text-[var(--color-ink-dim)] max-w-xl leading-relaxed mb-8">
              A medallion-style icon set with a cartoonish splash on play.
              Configurable trigger, per-icon colour control. React + Next.js + Vue +
              Svelte + vanilla — Flutter coming soon. {icons.length} today,
              growing toward 100k+.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/icons"
                className="px-5 py-2.5 bg-[var(--color-accent)] text-[var(--color-bg)] rounded font-mono text-sm uppercase tracking-wider font-semibold hover:brightness-110 transition">
                Browse all icons
              </Link>
              <Link href="/playground"
                className="px-5 py-2.5 border border-[var(--color-line-strong)] rounded font-mono text-sm uppercase tracking-wider hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition">
                Open playground
              </Link>
              <a href="https://github.com/Ewooral/ewooral-icons" target="_blank" rel="noreferrer"
                className="px-5 py-2.5 border border-[var(--color-line)] rounded font-mono text-sm uppercase tracking-wider text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] transition">
                GitHub
              </a>
            </div>

            <div className="mt-10 inline-block bg-[var(--color-bg-2)] border border-[var(--color-line)] rounded px-4 py-3 font-mono text-sm">
              <span className="text-[var(--color-ink-faint)]">$ </span>
              <span className="text-[var(--color-ink)]">pnpm add @ewooral/icons</span>
            </div>
          </div>

          {/* Featured grid — visible motion */}
          <div className="grid grid-cols-4 gap-3">
            {featured.map((icon, i) => (
              <div key={icon.name}
                className="edge-card aspect-square flex items-center justify-center"
                style={{
                  background: "var(--color-bg-2)",
                  animation: `hero-drift 4s ease-in-out ${i * 0.13}s infinite`,
                }}>
                <InlineIcon svg={icon.svg} size={36} accent="var(--color-accent)" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What makes it different */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[var(--color-line)]">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}>
          Why this set
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Feature title="The medallion"
            body="Every icon sits on a soft disc with a dotted decorative ring and a gold petal-ribbon spark. You can read 'this is Ewooral' from across the room. Toggle off with `plain` for naked-glyph use." />
          <Feature title="Cartoonish splash"
            body="On hover (or click, or scroll-into-view, or whenever you say), five gold particles burst out of the petal. Pure CSS — no JS runtime, no Lottie." />
          <Feature title="Configurable trigger"
            body="Hover is the default. Switch to click, focus, mount, viewport, or fully manual via ref.play(). Same contract in React, Vue, Svelte, vanilla — Flutter soon." />
          <Feature title="Three colour layers"
            body="Glyph (color), petal-ribbon (accent), and disc background (bg) are independently controllable per icon. No more 'currentColor or nothing' bind." />
          <Feature title="Animation precision"
            body="Per-icon control over motion count (once / N times / repeat), speed, and delay. Built-in 35%-active / 65%-rest keyframes give visible pauses between repeats." />
          <Feature title="100k roadmap"
            body="Architecture is per-icon file from day one — adding 100k icons doesn't bloat any consumer. Sub-packs (commerce, salon, clinic, fitness) ship independently." />
        </div>
      </section>

      {/* Variety strip — show range with different motions */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[var(--color-line)]">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Hover any, click any, scroll past any
          </h2>
          <Link href="/icons" className="label-cap hover:text-[var(--color-accent)] transition">
            View all {icons.length} →
          </Link>
        </div>
        <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
          {icons.slice(0, 40).map((icon) => (
            <Link key={icon.name} href={`/icons/${icon.name}`}
              className="edge-card aspect-square flex items-center justify-center bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)]">
              <InlineIcon svg={icon.svg} size={28} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </h3>
      <p className="text-[var(--color-ink-dim)] leading-relaxed">{body}</p>
    </div>
  );
}
