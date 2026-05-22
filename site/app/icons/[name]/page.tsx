import { notFound } from "next/navigation";
import Link from "next/link";
import { loadIcons, loadIcon } from "../../../lib/icons";
import { IconDetail } from "../../../components/IconDetail";

export function generateStaticParams() {
  return loadIcons().map((i) => ({ name: i.name }));
}

// Next.js 16: `params` is async. Must be awaited before reading.
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const icon = loadIcon(name);
  return {
    title: icon ? `${icon.displayName}` : "Icon not found",
    description: icon ? `${icon.displayName} — ${icon.motion ?? "static"} motion. Inspect, copy, and customise this icon.` : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const icon = loadIcon(name);
  if (!icon) notFound();

  // Index of all icons for prev/next nav
  const all = loadIcons();
  const idx = all.findIndex((i) => i.name === icon.name);
  const prev = all[(idx - 1 + all.length) % all.length];
  const next = all[(idx + 1) % all.length];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <Link href="/icons" className="label-cap hover:text-[var(--color-accent)] transition">
          ← All icons
        </Link>
        <div className="flex gap-3">
          <Link href={`/icons/${prev.name}`} className="label-cap hover:text-[var(--color-accent)] transition">
            ← {prev.displayName}
          </Link>
          <Link href={`/icons/${next.name}`} className="label-cap hover:text-[var(--color-accent)] transition">
            {next.displayName} →
          </Link>
        </div>
      </div>

      <IconDetail
        name={icon.name}
        displayName={icon.displayName}
        pascal={icon.pascal}
        motion={icon.motion}
        svg={icon.svg}
      />
    </div>
  );
}
