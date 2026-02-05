import { defineConfig } from "tsup";

/**
 * tsup Configuration for Genesis CLI
 *
 * WHY: We use tsup as our bundler because it provides zero-config TypeScript bundling
 * with excellent ESM support, tree-shaking, and minification out of the box.
 *
 * HOW: This config bundles src/index.ts into a single ESM file with:
 * - Shebang injection for CLI execution (#!/usr/bin/env node)
 * - Minification for smaller bundle size
 * - Clean build directory on each build
 * - Source maps for debugging
 */
export default defineConfig({
  // Entry point - the main CLI file
  entry: ["src/index.ts"],
  // Output format - ESM only since we're a modern Node.js CLI
  format: ["esm"],
  // Target Node.js 18+ for modern feature support
  target: "node18",
  // Minify output for smaller bundle size
  minify: true,
  // Clean the dist directory before each build
  clean: true,

  shims: true,
  // Add shebang to make the output file executable as a CLI
  // This adds #!/usr/bin/env node at the top of the bundle
  banner: {
    js: "#!/usr/bin/env node",
  },
  // Optional: Since it's a CLI, you usually want one single file
  // with no dependencies externalized except for built-in Node modules.
  noExternal: ["commander", "enquirer"],
});
