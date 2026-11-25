import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// Keep SUID packages out of dependency pre-bundling, as the SUID plugin did.
const suidPackages = [
  "@suid/base", "@suid/codemod", "@suid/css", "@suid/icons-material",
  "@suid/material", "@suid/styled-engine", "@suid/system", "@suid/types",
  "@suid/utils",
];

export default defineConfig({
  plugins: [solidPlugin()],
  optimizeDeps: { exclude: suidPackages },
  ssr: { noExternal: suidPackages },
  build: {
    target: "esnext",
  },
  server: {
    port: 3000
  }
});
