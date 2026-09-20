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
      // Self-hosted in quartz/styles/fonts.scss. Pretendard carries Korean and
      // Latin together, so a heading never mixes two faces mid-line; the Latin
      // display face is applied per-component through --displayFont.
      typography: {
        header: "Pretendard",
        body: "Pretendard",
        code: "IBM Plex Mono",
      },
      colors: {
        // Olive stays the single accent, reserved for links and active state.
        // Grounds sit close to white so headings can carry near-black and the
        // page reads crisp; every pair clears 6:1 on both ground and surface.
        lightMode: {
          light: "#fcfcfa",
          lightgray: "#e4e5de",
          gray: "#5c6057",
          darkgray: "#2f322c",
          dark: "#14170f",
          secondary: "#4f5e3c",
          tertiary: "#4f5e3c",
          highlight: "rgba(79, 94, 60, 0.10)",
          textHighlight: "#dde3d4",
        },
        // The site is light only: there is no dark palette, no toggle, and no
        // `prefers-color-scheme` block, so `saved-theme` is never set and this
        // never matches. `QuartzConfig` requires the key, so it mirrors
        // lightMode — a stale attribute from a returning visitor still renders
        // the real design. Do not reintroduce a dark palette.
        darkMode: {
          light: "#fcfcfa",
          lightgray: "#e4e5de",
          gray: "#5c6057",
          darkgray: "#2f322c",
          dark: "#14170f",
          secondary: "#4f5e3c",
          tertiary: "#4f5e3c",
          highlight: "rgba(79, 94, 60, 0.10)",
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
        theme: {
          light: "github-light",
          dark: "github-light",
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
