export function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <p className="text-sm text-[var(--color-ink-dim)]">
            Built by{" "}
            <a href="https://ewooral.com" className="text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-colors">
              Ewooral & BFAM Holdings
            </a>
            . MIT licensed.
          </p>
          <p className="label-cap mt-2">Accra, Ghana · 2026</p>
        </div>
        <div className="flex gap-6 text-sm text-[var(--color-ink-dim)]">
          <a href="https://github.com/Ewooral/ewooral-icons" target="_blank" rel="noreferrer" className="hover:text-[var(--color-ink)]">
            GitHub
          </a>
          <a href="https://www.npmjs.com/package/@ewooral/icons" target="_blank" rel="noreferrer" className="hover:text-[var(--color-ink)]">
            npm
          </a>
          <a href="https://pub.dev/packages/ewooral_icons" target="_blank" rel="noreferrer" className="hover:text-[var(--color-ink)]">
            pub.dev
          </a>
          <a href="/roadmap" className="hover:text-[var(--color-ink)]">Roadmap</a>
          <a href="/docs/contributing" className="hover:text-[var(--color-ink)]">Contribute</a>
        </div>
      </div>
    </footer>
  );
}
