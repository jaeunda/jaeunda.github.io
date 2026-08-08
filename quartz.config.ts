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
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Fraunces",
        body: "Noto Sans KR",
        code: "IBM Plex Mono",
      },
      colors: {
        // Turn 3 확정 시안 — 올리브를 "링크·활성 상태"로만 집중시키고
        // 대비 실패였던 secondary(2.35:1)/gray(3.91:1)를 접근성 기준(4.5:1+)으로 교체.
        lightMode: {
          light: "#fafaf8",
          lightgray: "#e3e4df",
          gray: "#5f6259",
          darkgray: "#33362f",
          dark: "#1a1d17",
          secondary: "#4f5e3c",
          tertiary: "#4f5e3c",
          highlight: "rgba(79, 94, 60, 0.12)",
          textHighlight: "#dde3d4",
        },
        darkMode: {
          light: "#1a1c16",
          lightgray: "#2e3229",
          gray: "#9b9f94",
          darkgray: "#c7ccc3",
          dark: "#f0f2ee",
          secondary: "#a9ba8e",
          tertiary: "#a9ba8e",
          highlight: "rgba(169, 186, 142, 0.16)",
          textHighlight: "#2a3123",
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
        theme: {
          light: "github-light",
          dark: "github-dark",
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
