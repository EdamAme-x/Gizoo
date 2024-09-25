import fs from "node:fs";
import type { Plugin, ViteDevServer } from "vite";

function touchFile(filePath: string): void {
  const time = new Date();
  fs.utimesSync(filePath, time, time);
}

type TouchGlobalCSSPluginOptions = {
  cssFilePath: string;
  watchMatch: RegExp;
};

export default function refreshGlobalCSSPlugin({
  cssFilePath,
  watchMatch,
}: TouchGlobalCSSPluginOptions): Plugin {
  return {
    name: "touch-global-css",
    configureServer(server: ViteDevServer) {
      server.watcher.on("change", (path: string) => {
        if (watchMatch.test(path)) {
          touchFile(cssFilePath);
        }
      });
    },
  };
}
