import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so we can serve from any plain HTTP host (Contabo nginx).
  output: "export",
  images: { unoptimized: true },
  // Quiet the "multiple lockfiles" warning — the docs site lives inside
  // the larger ewooral-icons workspace.
  turbopack: { root: __dirname },
};
export default nextConfig;
