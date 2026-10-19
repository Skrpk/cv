import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dir = import.meta.dirname;

// Plain Vite build for an MV3 extension. The two extension pages (side panel,
// options) are multi-page HTML entries. The service worker and manifest are
// hand-written plain files in public/ and copied verbatim to dist/.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    modulePreload: { polyfill: false }, // avoid an inline script (MV3 CSP)
    rollupOptions: {
      input: {
        sidepanel: resolve(dir, "sidepanel.html"),
        options: resolve(dir, "options.html"),
      },
    },
  },
});
