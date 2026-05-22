import { loadIcons } from "../../lib/icons";
import { IconBrowser } from "../../components/IconBrowser";

export const metadata = { title: "Browse icons" };

export default function IconsPage() {
  const icons = loadIcons();
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="label-cap mb-3">Browse · {icons.length} icons</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          The full set
        </h1>
        <p className="text-[var(--color-ink-dim)] mt-3 max-w-2xl">
          Click any icon for its detail page (copy SVG / JSX / sprite snippet, live preview at all sizes,
          per-icon prop controls).
        </p>
      </div>
      <IconBrowser
        icons={icons.map((i) => ({
          name: i.name,
          displayName: i.displayName,
          pascal: i.pascal,
          motion: i.motion,
          svg: i.svg,
        }))}
      />
    </div>
  );
}
