export const metadata = { title: "Roadmap" };

const ITEMS = [
  { v: "v0.1", status: "done", title: "56 medallion icons + trigger system + vanilla helper", date: "May 2026" },
  { v: "v0.2", status: "next", title: "icons.ewooral.com docs site live, npm publish", date: "May 2026" },
  { v: "v0.3", status: "next", title: "@ewooral/icons/flutter — Dart widgets for ahofe-mobile", date: "Jun 2026" },
  { v: "v0.4", status: "soon", title: "80+ icons (commerce, social, charts, salon-domain expansion)", date: "Jul 2026" },
  { v: "v0.5", status: "soon", title: "Domain packs — clinic, fitness, tutoring (other BFAM products)", date: "Q3 2026" },
  { v: "v0.6", status: "soon", title: "Animated GIFs / Lottie alternates for marketing use", date: "Q3 2026" },
  { v: "v1.0", status: "soon", title: "Replace lucide-react in ahofe-app, 200+ icons curated", date: "Q4 2026" },
  { v: "v2.0", status: "future", title: "Scale to 100k+ icons — sub-packs, indexed search, AI-assisted authoring", date: "2027" },
];

const STATUS_COLOR: Record<string, string> = {
  done:   "text-[var(--color-sage)] border-[var(--color-sage)]",
  next:   "text-[var(--color-accent)] border-[var(--color-accent)]",
  soon:   "text-[var(--color-ink-dim)] border-[var(--color-line-strong)]",
  future: "text-[var(--color-ink-faint)] border-[var(--color-line)]",
};

export default function RoadmapPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="label-cap mb-3">Roadmap</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Where this is going
      </h1>
      <p className="text-[var(--color-ink-dim)] mb-10">
        The North Star is 100k+ icons covering everything we can think of — branded with the same medallion stamp.
      </p>

      <ol className="space-y-3">
        {ITEMS.map((item) => (
          <li key={item.v} className="edge-card flex items-start gap-4 p-5 bg-[var(--color-bg-2)]">
            <span className={`label-cap border rounded px-2 py-1 ${STATUS_COLOR[item.status]} shrink-0`}>
              {item.v}
            </span>
            <div className="flex-1">
              <p className="text-[var(--color-ink)]">{item.title}</p>
              <p className="label-cap mt-1">{item.date} · {item.status}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
