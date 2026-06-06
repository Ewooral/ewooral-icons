import { loadIconMeta } from "../../lib/icons";
import { IconStudio } from "../../components/studio/IconStudio";

export const metadata = { title: "Browse icons" };

export default function IconsPage() {
  // loadIconMeta() ships only { name, displayName, pascal, motion } to
  // the client (~8 KB). Each grid cell fetches its SVG lazily via
  // <img src="/svg/name.svg"> — no inline content in the bundle.
  const icons = loadIconMeta();
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="label-cap mb-3">Browse + test · {icons.length} icons</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          The full set
        </h1>
        <p className="text-[var(--color-ink-dim)] mt-3 max-w-2xl">
          Click any icon to open the in-place tester. Tweak motion, engine, signature, palette,
          colour vars — and copy a copy-paste-ready snippet for React / RN / Flutter / Vue / Svelte /
          Angular / inline SVG. Press <kbd className="font-mono text-xs">Esc</kbd> to close the panel.
        </p>
      </div>
      <IconStudio icons={icons} />
    </div>
  );
}
