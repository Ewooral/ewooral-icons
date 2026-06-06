// Live snippet builder — emits minimal, copy-paste-ready code per framework.
// Every prop the studio's Settings tab touches (size, motion, engine, speed,
// delay, trigger, repeat, repeatDelay, ember, plain, noPetal, signature, and
// colour-var overrides) flows through. Defaults stay implicit so the snippet
// reads cleanly — only the things that differ from canonical defaults show.

export type SnippetParams = {
  iconName: string;
  iconSvg: string;
  motion: string;
  engineName: string;
  size: number;
  ember: boolean;
  plain: boolean;
  noPetal: boolean;
  spark: string;
  speed: string;
  delay: string;
  trigger: string;
  repeat: string;
  repeatDelay: string;
  colors: Record<string, string>;
};

export type SnippetKey =
  | "react"
  | "react-native"
  | "flutter"
  | "vue"
  | "svelte"
  | "angular"
  | "html-svg"
  | "html-img";

export type SnippetBundle = Record<SnippetKey, string>;

const PROP_VARS: Record<string, string> = {
  "--ew-glyph":     "color",
  "--ew-accent":    "accent",
  "--ew-bg":        "bg",
  "--ew-highlight": "highlight",
  "--ew-secondary": "secondary",
  "--ew-outline":   "outline",
};

const RN_KEY_MAP: Record<string, string> = {
  "--ew-glyph":"glyph","--ew-outline":"outline","--ew-secondary":"secondary",
  "--ew-highlight":"highlight","--ew-glyph-2":"glyphTwo","--ew-spark-light":"sparkLight",
  "--ew-rose":"rose","--ew-accent-deep":"accentDeep","--ew-accent":"accent",
  "--ew-signature":"signature","--ew-bg":"bg",
};

function timeToMs(s: string): number {
  const t = s.trim();
  if (t.endsWith("ms")) return Number(t.slice(0, -2)) || 0;
  if (t.endsWith("s"))  return Math.round((Number(t.slice(0, -1)) || 0) * 1000);
  return Number(t) || 0;
}

function pascalize(name: string): string {
  return "EW" + name
    .split("-")
    .map((s) => (s[0]?.toUpperCase() ?? "") + s.slice(1))
    .join("");
}

export function buildLiveSnippets(p: SnippetParams): SnippetBundle {
  const {
    iconName, iconSvg, motion, engineName, size, ember, plain, noPetal, spark,
    speed, delay, trigger, repeat, repeatDelay, colors,
  } = p;

  const pascal = pascalize(iconName);
  const speedMs = timeToMs(speed);
  const delayMs = timeToMs(delay);
  const repeatN = Number(repeat) || 0;
  const repeatDelayMs = timeToMs(
    repeatDelay.endsWith("s") || repeatDelay.endsWith("ms") ? repeatDelay : `${repeatDelay}s`,
  );

  const overriddenColors = Object.entries(colors);
  const hasColorOverrides = overriddenColors.length > 0;
  const propColorEntries = overriddenColors.filter(([k]) => PROP_VARS[k]);
  const styleColorEntries = overriddenColors.filter(([k]) => !PROP_VARS[k]);

  // ───── React ─────
  const reactProps = [
    `      size={${size}}`,
    `      motion="${motion}"`,
    `      engine="${engineName}"`,
    `      trigger="${trigger}"`,
    `      speed="${speed}"`,
    `      delay="${delay}"`,
    `      data-repeat="${repeat}"`,
    `      data-repeat-delay="${repeatDelay}"`,
    `      signature="${spark}"`,
  ];
  if (plain)   reactProps.push(`      plain`);
  if (noPetal) reactProps.push(`      noPetal`);
  if (ember)   reactProps.push(`      ember`);
  for (const [k, v] of propColorEntries) {
    reactProps.push(`      ${PROP_VARS[k]}="${v}"`);
  }
  if (styleColorEntries.length) {
    const lines = styleColorEntries
      .map(([k, v]) => `        "${k}": "${v}",`)
      .join("\n");
    reactProps.push(`      style={{\n${lines}\n      }}`);
  }
  const react = `import { ${pascal} } from "@ewooral/icons";
import "@ewooral/icons/styles/icons.css";

export default function Example() {
  return (
    <${pascal}
${reactProps.join("\n")}
    />
  );
}`;

  // ───── React Native ─────
  const rnProps = [
    `      size={${size}}`,
    `      motion="${motion}"`,
    `      speed={${speedMs}}`,
    `      delay={${delayMs}}`,
    `      trigger="${trigger === "hover" ? "press" : trigger}"`,
    `      signature="${spark}"`,
  ];
  if (plain)   rnProps.push(`      plain`);
  if (noPetal) rnProps.push(`      noPetal`);
  if (ember)   rnProps.push(`      ember`);
  if (hasColorOverrides) {
    const lines = overriddenColors
      .map(([k, v]) => `        ${RN_KEY_MAP[k] ?? k}: "${v}",`)
      .join("\n");
    rnProps.push(`      colors={{\n${lines}\n      }}`);
  }
  const reactNative = `import { ${pascal} } from "@ewooral/icons-native";

export default function Example() {
  return (
    <${pascal}
${rnProps.join("\n")}
    />
  );
}`;

  // ───── Flutter ─────
  const motionDart = motion.replace(/-/g, "_");
  const triggerDart =
    trigger === "hover" || trigger === "click" ? "tap"
      : trigger === "focus" ? "tap"
      : trigger === "viewport" ? "mount"
      : trigger;
  const flutterLines = [
    `      name: '${iconName}',`,
    `      size: ${size}.0,`,
    `      motion: EwMotion.${motionDart},`,
    `      speed: const Duration(milliseconds: ${speedMs}),`,
    `      delay: const Duration(milliseconds: ${delayMs}),`,
    `      trigger: EwTrigger.${triggerDart},`,
    `      repeat: ${repeatN},`,
    `      repeatDelay: const Duration(milliseconds: ${repeatDelayMs}),`,
    `      signature: EwSignature.${spark},`,
  ];
  if (plain)   flutterLines.push(`      plain: true,`);
  if (noPetal) flutterLines.push(`      noPetal: true,`);
  if (ember)   flutterLines.push(`      ember: true,`);
  if (hasColorOverrides) {
    const hexOf = (v: string) => {
      const m = v.match(/^#([0-9a-f]{6})$/i);
      return m ? `0xFF${m[1].toUpperCase()}` : `0xFF000000 /* ${v} */`;
    };
    const lines = overriddenColors
      .map(([k, v]) => `        ${RN_KEY_MAP[k] ?? k}: const Color(${hexOf(v)}),`)
      .join("\n");
    flutterLines.push(`      palette: EwPalette(\n${lines}\n      ),`);
  }
  const flutter = `import 'package:ewooral_icons/ewooral_icons.dart';
import 'package:flutter/material.dart';

class Example extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return EwIcon(
${flutterLines.join("\n")}
    );
  }
}`;

  // ───── Vue 3 ─────
  const vueLines = [
    `    :size="${size}"`,
    `    motion="${motion}"`,
    `    engine="${engineName}"`,
    `    trigger="${trigger}"`,
    `    speed="${speed}"`,
    `    delay="${delay}"`,
    `    data-repeat="${repeat}"`,
    `    data-repeat-delay="${repeatDelay}"`,
    `    signature="${spark}"`,
  ];
  if (plain)   vueLines.push(`    plain`);
  if (noPetal) vueLines.push(`    no-petal`);
  if (ember)   vueLines.push(`    ember`);
  if (hasColorOverrides) {
    const lines = overriddenColors
      .map(([k, v]) => `      '${k}': '${v}',`)
      .join("\n");
    vueLines.push(`    :style="{\n${lines}\n    }"`);
  }
  const vue = `<script setup>
import { ${pascal} } from "@ewooral/icons/vue";
import "@ewooral/icons/styles/icons.css";
</script>

<template>
  <${pascal}
${vueLines.join("\n")}
  />
</template>`;

  // ───── Svelte ─────
  const svelteLines = [
    `    size={${size}}`,
    `    motion="${motion}"`,
    `    engine="${engineName}"`,
    `    trigger="${trigger}"`,
    `    speed="${speed}"`,
    `    delay="${delay}"`,
    `    data-repeat="${repeat}"`,
    `    data-repeat-delay="${repeatDelay}"`,
    `    signature="${spark}"`,
  ];
  if (plain)   svelteLines.push(`    plain`);
  if (noPetal) svelteLines.push(`    noPetal`);
  if (ember)   svelteLines.push(`    ember`);
  if (hasColorOverrides) {
    svelteLines.push(`    style="${overriddenColors.map(([k, v]) => `${k}: ${v};`).join(" ")}"`);
  }
  const svelte = `<script>
  import { ${pascal} } from "@ewooral/icons/svelte";
  import "@ewooral/icons/styles/icons.css";
</script>

<${pascal}
${svelteLines.join("\n")}
/>`;

  // ───── Angular ─────
  const angularAttrs = [
    `  [size]="${size}"`,
    `  motion="${motion}"`,
    `  engine="${engineName}"`,
    `  trigger="${trigger}"`,
    `  speed="${speed}"`,
    `  delay="${delay}"`,
    `  data-repeat="${repeat}"`,
    `  data-repeat-delay="${repeatDelay}"`,
    `  signature="${spark}"`,
  ];
  if (plain)   angularAttrs.push(`  [plain]="true"`);
  if (noPetal) angularAttrs.push(`  [noPetal]="true"`);
  if (ember)   angularAttrs.push(`  [ember]="true"`);
  if (hasColorOverrides) {
    angularAttrs.push(
      `  [style]="{${overriddenColors.map(([k, v]) => ` '${k}': '${v}'`).join(",")} }"`,
    );
  }
  const ngSelector = "ew-" + iconName;
  const angular = `// app.module.ts
import { EwIconsModule } from "@ewooral/icons/angular";
@NgModule({ imports: [EwIconsModule] }) export class AppModule {}

<!-- template -->
<${ngSelector}
${angularAttrs.join("\n")}
></${ngSelector}>`;

  // ───── Inline SVG ─────
  const styleVars = hasColorOverrides
    ? `style="${overriddenColors.map(([k, v]) => `${k}: ${v};`).join(" ")}"`
    : "";
  const dataAttrs = [
    `data-engine="${engineName}"`,
    `data-motion="${motion}"`,
    `data-trigger="${trigger}"`,
    `data-repeat="${repeat}"`,
    `data-repeat-delay="${repeatDelay}"`,
    ember ? `data-ember="true"` : "",
  ].filter(Boolean).join(" ");
  let svgInline = iconSvg.replace(
    /<svg([^>]*?)>/,
    `<svg$1 width="${size}" height="${size}" ${dataAttrs} ${styleVars}>`,
  );
  if (plain) {
    svgInline = svgInline.replace(/<g class="ew-chrome">[\s\S]*?<\/g>/, "");
  }
  if (noPetal) {
    svgInline = svgInline.replace(/<g class="ew-signature"[\s\S]*?<\/g>/, "");
  }
  const vanillaInline = `<!-- Paste anywhere. Animation needs the stylesheet + (for GSAP motions) the engine script. -->
<link rel="stylesheet" href="https://unpkg.com/@ewooral/icons/dist/styles/icons.css" />

${svgInline}

<script type="module">
  import * as engine from "https://unpkg.com/@ewooral/icons/dist/engines/index.js";
  document.querySelectorAll(".ew-icon").forEach((el) => {
    el.addEventListener("mouseenter", () => engine.play(el));
    el.addEventListener("mouseleave", () => engine.stop(el));
  });
</script>`;

  // ───── <img> ─────
  const vanillaImg = `<img
  src="https://icons.ewooral.com/icons/${iconName}.svg"
  width="${size}" height="${size}"
  alt="${iconName}"
/>`;

  return {
    react,
    "react-native": reactNative,
    flutter,
    vue,
    svelte,
    angular,
    "html-svg": vanillaInline,
    "html-img": vanillaImg,
  };
}
