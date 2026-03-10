import { cp, mkdir } from "node:fs/promises";
import { defineConfig } from "tsdown";

const outDir = "dist";

export default defineConfig({
  entry: {
    content: "src/content.tsx",
  },
  format: ["iife"],
  globalName: "VisualJsonBrowserExtension",
  platform: "browser",
  target: "chrome109",
  clean: true,
  sourcemap: true,
  minify: true,
  dts: false,
  deps: {
    alwaysBundle: [/.*/],
    onlyAllowBundle: false,
  },
  css: {
    splitting: true,
  },
  hooks: {
    "build:done": async () => {
      await mkdir(outDir, { recursive: true });
      await cp("manifest.json", `${outDir}/manifest.json`);
    },
  },
});
