import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Served from https://jaeunda.github.io/portfolio-dbinc/, so every asset URL
// carries that prefix. `static/` replaces Vite's default `public/` because the
// repository root ignores any `public` directory (the Quartz build output).
export default defineConfig({
  base: "/portfolio-dbinc/",
  publicDir: "static",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
})
