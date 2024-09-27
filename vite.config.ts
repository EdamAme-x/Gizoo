import { PluginOption, defineConfig } from "vite";
import { crx, defineManifest } from "@crxjs/vite-plugin";

const viteManifestHackIssue846: PluginOption & {
  renderCrxManifest: (manifest: any, bundle: any) => void;
} = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json'];
    bundle['manifest.json'].fileName = 'manifest.json';
    delete bundle['.vite/manifest.json'];
  },
};

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
  permissions: ["activeTab"]
});

export default defineConfig({
  plugins: [
    viteManifestHackIssue846,
    crx({ manifest }) as any,
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
