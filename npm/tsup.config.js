import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"], // Change this if your entry file is different
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [], // Add dependencies here if you want to exclude them from the bundle
});
