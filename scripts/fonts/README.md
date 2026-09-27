# Site fonts

Every face on the site is self-hosted, declared once in
`quartz/styles/fonts.scss` and served from `quartz/static/fonts/`.
`quartz.config.ts` sets `fontOrigin: "local"`, so no page requests
fonts.googleapis.com.

| File                               | Face                                         | Used by   | Source                                                                                                    |
| ---------------------------------- | -------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `fraunces-latin.woff2`             | Fraunces Variable (wght 100–900), latin      | blog      | [@fontsource-variable/fraunces](https://www.npmjs.com/package/@fontsource-variable/fraunces), SIL OFL 1.1 |
| `noto-sans-kr-subset.woff2`        | Noto Sans KR Variable (wght 100–900), subset | blog      | [google/fonts `ofl/notosanskr`](https://github.com/google/fonts/tree/main/ofl/notosanskr), SIL OFL 1.1    |
| `ibm-plex-mono-latin-400.woff2`    | IBM Plex Mono 400, latin + arrows            | both      | [@ibm/plex-mono](https://www.npmjs.com/package/@ibm/plex-mono) complete woff2, subset, SIL OFL 1.1        |
| `ibm-plex-mono-latin-500.woff2`    | IBM Plex Mono 500, latin + arrows            | both      | [@ibm/plex-mono](https://www.npmjs.com/package/@ibm/plex-mono) complete woff2, subset, SIL OFL 1.1        |
| `ibm-plex-mono-latin-600.woff2`    | IBM Plex Mono 600, latin + arrows            | both      | [@ibm/plex-mono](https://www.npmjs.com/package/@ibm/plex-mono) complete woff2, subset, SIL OFL 1.1        |
| `pretendard-variable-subset.woff2` | Pretendard Variable (wght 100–900), subset   | portfolio | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) v1.3.9, SIL OFL 1.1                   |
| `space-grotesk-variable.woff2`     | Space Grotesk (wght 300–700), latin          | portfolio | Google Fonts, SIL OFL 1.1                                                                                 |

Fraunces is the blog's display face — the wordmark, the home masthead, every
title and a post's own h2/h3 — and Noto Sans KR sets its prose. Pretendard and
Space Grotesk are declared for the unlisted `content/portfolio-*` pages only. A
browser downloads only the faces a page actually sets, so a blog page fetches
Fraunces + Noto Sans KR + Plex and a portfolio page fetches Pretendard + Space
Grotesk + Plex; neither pays for the other.

Fraunces, Space Grotesk and IBM Plex Mono carry no Hangul. Each falls back to
the reading face of the page it is on, so a Korean glyph inside a Fraunces
heading lands on Noto Sans KR rather than on whatever the OS supplies — that
mixed line is the intended design, not a failure. Space Grotesk and IBM Plex
Mono are the latin subsets for `U+0000-00FF`.

They are self-hosted rather than loaded from a CDN so the site renders the same
on networks that block jsdelivr or fonts.gstatic.com, and so there is no font
swap on first paint.

Every command below assumes one venv:

```bash
python3 -m venv /tmp/fenv && /tmp/fenv/bin/pip install fonttools brotli
```

## Fraunces

Fontsource's `latin` variable file is taken as-is — 36KB, wght 100–900, full
basic latin plus the punctuation the titles use. It is not re-subset: the
wordmark-only cut it replaced covered eleven letters, which is why it had to be
rebuilt the moment Fraunces went back on the headings.

```bash
curl -sL -o quartz/static/fonts/fraunces-latin.woff2 \
  https://cdn.jsdelivr.net/npm/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2
```

## Noto Sans KR

`portfolio-subset-chars.txt` holds every character the Korean subsets cover: all
characters currently in `content/`, the UI copy in the home Stack components,
the vocabulary used across the application drafts, latin, punctuation, arrows,
and every Hangul syllable without a final consonant. Any character outside that
set falls back to whatever Korean face the visitor's OS supplies, which will not
match.

**Regenerate after adding Korean copy** — to a post, to `content/index.md`, or
to a component's UI strings:

```bash
curl -sL -o /tmp/NotoSansKR.ttf \
  'https://github.com/google/fonts/raw/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf'
/tmp/fenv/bin/pyftsubset /tmp/NotoSansKR.ttf \
  --text-file=scripts/fonts/portfolio-subset-chars.txt \
  --flavor=woff2 --layout-features='*' \
  --output-file=quartz/static/fonts/noto-sans-kr-subset.woff2
```

## Pretendard (portfolio pages)

Same charset, same reason to regenerate — but only the Korean on
`content/portfolio-*` pages reaches this face.

```bash
curl -sL -o /tmp/PretendardVariable.woff2 \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2
/tmp/fenv/bin/pyftsubset /tmp/PretendardVariable.woff2 \
  --text-file=scripts/fonts/portfolio-subset-chars.txt \
  --flavor=woff2 --layout-features='*' \
  --output-file=quartz/static/fonts/pretendard-variable-subset.woff2
```

## IBM Plex Mono

The three weights are cut from IBM's complete files so the UI's arrows and
typographic punctuation stay in the mono instead of falling back mid-line
(fontsource's `latin` range has no `→`):

```bash
for w in Regular:400 Medium:500 SemiBold:600; do n=${w%%:*}; k=${w##*:}
  curl -sL -o /tmp/IBMPlexMono-$n.woff2 \
    https://cdn.jsdelivr.net/npm/@ibm/plex-mono/fonts/complete/woff2/IBMPlexMono-$n.woff2
  /tmp/fenv/bin/pyftsubset /tmp/IBMPlexMono-$n.woff2 \
    --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2010-2027,U+2030-203A,U+2190-2193,U+2212,U+2318,U+25B8,U+FEFF" \
    --flavor=woff2 --layout-features='*' \
    --output-file=quartz/static/fonts/ibm-plex-mono-latin-$k.woff2
done
```
