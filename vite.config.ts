import path from "node:path";
import { defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";
import viteRefreshGlobalCss from "./refresh-global-css.ts";

const manifest = defineManifest({
  manifest_version: 3,
  name: "Gizoo - Tamper with Website",
  version: "1.0.0",
  description: "Easily tamper with the content on the site.",
  author: "EdamAme-x",
  homepage_url: "https://github.com/EdamAme-x/Gizoo",
  action: {
    default_popup: "index.html",
    default_title: "Gizoo",
    default_icon: "icons/gizoo_icon.png",
  },
  icons: {
    "250": "icons/gizoo_icon.png",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      run_at: "document_end",
      all_frames: true,
      js: ["src/content_scripts/index.ts"],
    },
  ],
});

export default defineConfig({
  // deno-lint-ignore no-explicit-any
  plugins: [
    crx({ manifest }) as any,
    viteRefreshGlobalCss({
      cssFilePath: path.resolve(import.meta.url, "src/style.css"),
      watchMatch: /src/,
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 2189,
    strictPort: true,
    hmr: {
      port: 2189,
    },
  },
});
