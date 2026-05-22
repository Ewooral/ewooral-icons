import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: "playground",
  plugins: [react()],
  resolve: {
    alias: {
      "@svg": path.resolve(__dirname, "src/svg"),
      "@styles": path.resolve(__dirname, "src/styles"),
    },
  },
  server: {
    port: 5174,
    open: false,
  },
});
