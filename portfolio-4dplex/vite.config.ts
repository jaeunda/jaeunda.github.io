import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// The site is served from https://jaeunda.github.io/portfolio-4dplex/, so every
// asset URL has to carry that prefix. `static/` is used instead of Vite's
// default `public/` because the repository root ignores any `public` directory
// (it is the Quartz build output).
export default defineConfig({
  base: "/portfolio-4dplex/",
  publicDir: "static",
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsInlineLimit: 0,
  },
})
