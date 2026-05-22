import Link from "next/link";

const NAV = [
  { href: "/icons",      label: "Browse" },
  { href: "/playground", label: "Playground" },
  { href: "/docs",       label: "Docs" },
  { href: "/roadmap",    label: "Roadmap" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--color-bg)]/80 border-b border-[var(--color-line)]">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <svg viewBox="0 0 24 24" width="22" height="22" className="ew-icon" data-motion="pop">
            <g className="ew-chrome">
              <path className="ew-backdrop" fill="var(--color-accent)" fillOpacity="0.18"
                    d="M12 1.6 C 18 2.4 22.4 6.4 22.4 12 C 22.4 17.6 18 22 12 22.4 C 6 22 1.6 17.6 1.6 12 C 1.6 6.4 6 2.4 12 1.6 Z" />
              <path fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.45"
                    strokeDasharray="0.4 1.8" strokeLinecap="round"
                    d="M12 3.2 C 17.2 3.9 20.8 7.2 20.8 12 C 20.8 16.8 17.2 20.4 12 20.8 C 6.8 20.4 3.2 16.8 3.2 12 C 3.2 7.2 6.8 3.9 12 3.2 Z" />
              <path className="ew-spark" fill="var(--color-accent)"
                    d="M18.5 3.4 C 20.4 3.4 21.6 4.8 21.4 6.6 C 21.2 7.4 20.4 7.7 19.4 7.5 C 18.4 7.2 17.6 6.4 17.6 5.4 C 17.6 4.4 18 3.8 18.5 3.4 Z" />
            </g>
          </svg>
          <span className="font-mono text-sm tracking-tight">
            <span className="text-[var(--color-accent)]">@ewooral</span>/icons
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 text-sm text-[var(--color-ink-dim)] hover:text-[var(--color-ink)] rounded transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <a
            href="https://github.com/Ewooral/ewooral-icons"
            target="_blank"
            rel="noreferrer"
            className="ml-2 label-cap border border-[var(--color-line)] rounded px-3 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
          >
            GitHub →
          </a>
        </nav>
      </div>
    </header>
  );
}
