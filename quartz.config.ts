import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "jaeunda.log",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: false,
    analytics: {
      provider: "cloudflare",
      token: process.env.CF_BEACON_TOKEN ?? "",
    },
    locale: "en-US",
    baseUrl: "jaeunda.github.io",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "published",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      // Self-hosted in quartz/styles/fonts.scss. Fraunces is the display face
      // again — the wordmark, every title and the article headings — and Noto
      // Sans KR sets the reading text. Fraunces carries no Hangul and falls
      // back to Noto Sans KR, so a Korean heading renders in the reading face
      // beside Latin words in the serif; that mixed line is the site's
      // signature, not an accident. See `scripts/fonts/README.md`.
      typography: {
        header: "Fraunces",
        body: "Noto Sans KR",
        code: "IBM Plex Mono",
      },
      colors: {
        // Olive `#4f5e3c` is the site's point colour and the only colour on
        // the page: links, active state, the wordmark. Everything else is a
        // neutral, and the neutrals are set for reading, not for mood — a
        // near-white ground a shade off pure white (so a long post does not
        // glare) carrying near-black text at 16.9:1. The cream the blog used
        // to sit on tinted every grey it touched; the greys are hue-free now
        // so the olive is the only thing the eye reads as a colour.
        //
        // Contrast on the ground: dark 16.9:1 · darkgray 13.4:1 · gray 6.3:1 ·
        // olive 6.8:1. `styles/portfolio.scss` keeps its own literals and is
        // unaffected.
        lightMode: {
          light: "#fbfbfa",
          lightgray: "#e5e6e2",
          gray: "#5c5f5a",
          darkgray: "#2b2d2a",
          dark: "#191a18",
          secondary: "#4f5e3c",
          tertiary: "#4f5e3c",
          highlight: "rgba(79, 94, 60, 0.12)",
          textHighlight: "#dde3d4",
        },
        // The site is light only: there is no dark palette, no toggle, and no
        // `prefers-color-scheme` block, so `saved-theme` is never set and this
        // never matches. `QuartzConfig` requires the key, so it mirrors
        // lightMode — a stale attribute from a returning visitor still renders
        // the real design. Do not reintroduce a dark palette.
        darkMode: {
          light: "#fbfbfa",
          lightgray: "#e5e6e2",
          gray: "#5c5f5a",
          darkgray: "#2b2d2a",
          dark: "#191a18",
          secondary: "#4f5e3c",
          tertiary: "#4f5e3c",
          highlight: "rgba(79, 94, 60, 0.12)",
          textHighlight: "#dde3d4",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        // Both keys are required, and both are the light theme: the site has no
        // dark palette, so a second token set on every span is dead weight.
        // Vitesse's greens and clay sit inside the olive palette; github-light's
        // red and purple read as someone else's site.
        theme: {
          light: "vitesse-light",
          dark: "vitesse-light",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(),
    ],
  },
}

export default config
