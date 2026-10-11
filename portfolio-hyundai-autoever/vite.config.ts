import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// Served from https://jaeunda.github.io/portfolio-hyundai-autoever/, so every
// asset URL carries that prefix. `static/` replaces Vite's default `public/`
// because the repository root ignores any `public` directory (the Quartz
// build output).
export default defineConfig({
  base: "/portfolio-hyundai-autoever/",
  publicDir: "static",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
})
