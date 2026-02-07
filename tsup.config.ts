import { defineConfig } from "tsup";
import pkg from "./package.json";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  clean: true,
  minify: true,
  define: {
    "process.env.NAME": JSON.stringify(pkg.name),
    "process.env.DESCRIPTION": JSON.stringify(pkg.description),
    "process.env.VERSION": JSON.stringify(pkg.version),
  },
  shims: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
