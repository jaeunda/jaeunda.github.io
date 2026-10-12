# surveillance-frontier site

A three-page site for the research project
[jaeunda/surveillance-frontier](https://github.com/jaeunda/surveillance-frontier),
served at <https://jaeunda.github.io/surveillance-frontier/>. It is a standalone
Vite + React + TypeScript app, separate from the Quartz blog.

| Path        | Page                                               |
| ----------- | -------------------------------------------------- |
| `/`         | Overview: the question and the results so far      |
| `/phase-0/` | Phase 0 pilot (Colab Tesla T4, 2026-10-04)         |
| `/phase-1/` | Phase 1 feasibility (AWS c7i.16xlarge, 2026-10-09) |

## Run

```bash
cd surveillance-frontier
npm ci
npm run dev       # http://localhost:5173/surveillance-frontier/
npm run build     # type check, client build, SSR build, prerender into dist/
npm run preview   # serve dist/ at http://localhost:4173/surveillance-frontier/
```

Every route is prerendered to its own `index.html`, so a direct visit or a
reload of `/phase-1/` works on GitHub Pages and the text is readable before
JavaScript loads. `.github/workflows/deploy.yml` builds the app after Quartz and
copies `dist/` into `public/surveillance-frontier/`.

## Where the numbers come from

All figures are from the project repository. `src/data/links.ts` pins every
document link to the commit the pages were written from; the pages themselves
show no commit hashes.

- Hand-entered values carry a comment naming their source file:
  `docs/phase0.md`, `docs/phase1.md`, the Phase 0 run folder
  (`experiments/phase0-pilot/results/colab-t4_2026-10-04/`) and the Phase 1 run
  folder (`experiments/phase1-feasibility/results/aws-c7i-16xlarge_2026-10-09/`,
  mainly `tables.md`).
- The rarity maps (`static/figures/rarity-*.png`), the price and volume under
  them, and the exact Phase 1 detection rates (`src/data/generated.ts`) are
  computed by `scripts/make-data.mjs` from the repository's own data files and
  `estimator_cells.csv`. The rarity is the Phase 0 score, computed as in
  `experiments/phase0-pilot/make_figures.py`. To regenerate:

  ```bash
  node scripts/make-data.mjs /path/to/surveillance-frontier
  ```

- `static/og.png` is the link-preview image (1200 × 630), drawn from the 1-minute
  rarity map.

## Structure

- `src/pages/`: one component per page. Phase pages use `WithToc`, a contents
  list that is sticky beside the text above 1080px and a plain list above it
  below that.
- `src/components/Page.tsx`: header, numbered sections, figures, tables,
  verdict chips, contents and the previous/next pager.
- `src/charts/`: SVG figures. Each wide drawing has a narrow twin
  (`.wide` / `.narrow`, switched at 640px) so text inside a figure never
  shrinks below a legible size on a phone. Text-heavy diagrams (the trial loop,
  stage bars, phase cards) are HTML and reflow instead.
- `src/router.tsx`: History API routing under the `/surveillance-frontier/`
  base; every history entry keeps its own scroll position, so Back, Forward and
  jumps to a section (`#id`) return to where the reader was.
