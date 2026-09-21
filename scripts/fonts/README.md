# Site fonts

Every face on the site is self-hosted, declared once in
`quartz/styles/fonts.scss` and served from `quartz/static/fonts/`.
`quartz.config.ts` sets `fontOrigin: "local"`, so no page requests
fonts.googleapis.com. The blog and the `content/portfolio-*.md` pages share these faces:

| File                               | Face                                        | Source                                                                                                           |
| ---------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pretendard-variable-subset.woff2` | Pretendard Variable (wght 100–900), subset  | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) v1.3.9, SIL OFL 1.1                          |
| `space-grotesk-variable.woff2`     | Space Grotesk (wght 300–700), latin         | Google Fonts, SIL OFL 1.1                                                                                        |
| `ibm-plex-mono-latin-400.woff2`    | IBM Plex Mono 400, latin                    | [@fontsource/ibm-plex-mono](https://www.npmjs.com/package/@fontsource/ibm-plex-mono) v5.0.13, SIL OFL 1.1        |
| `ibm-plex-mono-latin-600.woff2`    | IBM Plex Mono 600, latin                    | [@fontsource/ibm-plex-mono](https://www.npmjs.com/package/@fontsource/ibm-plex-mono) v5.0.13, SIL OFL 1.1        |
| `fraunces-wordmark.woff2`          | Fraunces (wght 100–900), basic latin subset | [@fontsource-variable/fraunces](https://www.npmjs.com/package/@fontsource-variable/fraunces) v5.2.5, SIL OFL 1.1 |

Pretendard sets Korean and Latin body copy and headings. Space Grotesk, IBM Plex
Mono and Fraunces carry no Hangul, so all three are applied only where the text
is always Latin, and all three fall back to Pretendard. Fraunces is the wordmark
and nothing else, so its subset covers basic latin only.

They are self-hosted rather than loaded from a CDN so the site renders the same
on networks that block jsdelivr or fonts.gstatic.com, and so there is no font
swap on first paint. Space Grotesk and IBM Plex Mono are the latin subsets for
`U+0000-00FF`.

## Regenerating the Pretendard subset

`portfolio-subset-chars.txt` holds every character the subset covers: all
characters currently in `content/`, the UI copy in the home Stack components,
the vocabulary used across the application drafts, latin, punctuation, arrows,
and every Hangul syllable without a final consonant. Any character outside that
set falls back to whatever Korean face the visitor's OS supplies, which will not
match Pretendard.

Pretendard now sets body copy for the whole site, not just the portfolio, so
**regenerate after adding Korean copy** — to a post, to `content/index.md`, or to
a component's UI strings. Rebuild the charset from the sources and re-subset:

```bash
python3 -m venv /tmp/fenv && /tmp/fenv/bin/pip install fonttools brotli
curl -sL -o /tmp/PretendardVariable.woff2 \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2
/tmp/fenv/bin/pyftsubset /tmp/PretendardVariable.woff2 \
  --text-file=scripts/fonts/portfolio-subset-chars.txt \
  --flavor=woff2 --layout-features='*' \
  --output-file=quartz/static/fonts/pretendard-variable-subset.woff2
```
