# Portfolio page fonts

`content/portfolio-it.md` uses two self-hosted faces, declared in
`quartz/styles/portfolio.scss` and served from `quartz/static/fonts/`:

| File                               | Face                                       | Source                                                                                  |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `pretendard-variable-subset.woff2` | Pretendard Variable (wght 100–900), subset | [orioncactus/pretendard](https://github.com/orioncactus/pretendard) v1.3.9, SIL OFL 1.1 |
| `space-grotesk-variable.woff2`     | Space Grotesk (wght 300–700), latin        | Google Fonts, SIL OFL 1.1                                                               |

Pretendard sets Korean and Latin body copy. Space Grotesk is used only for
product names and metric figures, where it has to carry weight against the
Korean headings.

They are self-hosted rather than loaded from a CDN so the page renders the same
on networks that block jsdelivr or fonts.gstatic.com, and so there is no font
swap on first paint. Space Grotesk is the latin subset Google Fonts serves for
`U+0000-00FF`.

## Regenerating the Pretendard subset

`portfolio-subset-chars.txt` holds every character the subset covers: all
characters currently in `content/`, the vocabulary used across the application
drafts, latin, punctuation, arrows, and every Hangul syllable without a final
consonant. Any character outside that set falls back to the site's Noto Sans KR.

After adding Korean copy that might use new syllables, add the characters to the
charset file and rebuild:

```bash
python3 -m venv /tmp/fenv && /tmp/fenv/bin/pip install fonttools brotli
curl -sL -o /tmp/PretendardVariable.woff2 \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2
/tmp/fenv/bin/pyftsubset /tmp/PretendardVariable.woff2 \
  --text-file=scripts/fonts/portfolio-subset-chars.txt \
  --flavor=woff2 --layout-features='*' \
  --output-file=quartz/static/fonts/pretendard-variable-subset.woff2
```
