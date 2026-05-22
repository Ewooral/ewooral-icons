import Link from "next/link";

export const metadata = { title: "Docs" };

const SECTIONS = [
  { href: "/docs/install",     title: "Install",           body: "pnpm add @ewooral/icons + the one-line CSS import." },
  { href: "/docs/triggers",    title: "Trigger system",    body: "Hover, click, focus, on-mount, on-viewport, manual — same contract everywhere." },
  { href: "/docs/colors",      title: "Colour layers",     body: "Glyph (color), petal-ribbon (accent), disc background (bg) — independently controllable." },
  { href: "/docs/motions",     title: "Motion vocabulary", body: "pop, tilt, swing, slide, spin, pulse, flip + the always-on splash burst." },
  { href: "/docs/react",       title: "React",             body: "Components, refs, imperative play, server-vs-client trade-offs." },
  { href: "/docs/nextjs",      title: "Next.js (App Router)", body: "Server Component compatibility, tree-shaking, when to add 'use client'." },
  { href: "/docs/vue",         title: "Vue 3",             body: "Raw SVG import + vanilla helper auto-wiring." },
  { href: "/docs/svelte",      title: "Svelte",            body: "@html + data-trigger pattern." },
  { href: "/docs/vanilla",     title: "Vanilla HTML",      body: "The 2-line drop-in: stylesheet + script." },
  { href: "/docs/flutter",     title: "Flutter",           body: "Coming v0.3 — Dart widgets via flutter_svg for ahofe-mobile." },
  { href: "/docs/contributing",title: "Contributing",      body: "How to add a new icon, the shape rules, the motion vocabulary." },
];

export default function DocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="label-cap mb-3">Docs</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Everything in @ewooral/icons
      </h1>
      <p className="text-[var(--color-ink-dim)] max-w-2xl mb-10">
        The icon set is small — what makes it interesting is the trigger system, the colour layering, and the
        per-icon motion control. Start here.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="edge-card block p-5 bg-[var(--color-bg-2)] hover:bg-[var(--color-bg-3)] transition-colors">
            <h2 className="font-semibold text-lg mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
            <p className="text-sm text-[var(--color-ink-dim)]">{s.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
