# portfolio-dbinc

DB Inc. 2026 하반기 신입사원 S/W엔지니어(금융계열사) 지원용 웹 포트폴리오입니다.

- 배포 주소: <https://jaeunda.github.io/portfolio-dbinc/>
- 기준 자료: 실제 제출한 지원서와 자기소개서. 사이트 전체가 "운영 중 오류를 재현하고, 변경
  영향까지 검증합니다"라는 한 문장으로 모입니다.
- 첫 화면에서 지원자와 프로젝트 4개를 모두 보여 줍니다. 대표 프로젝트(weavegate) 하나가 위에
  넓게, 나머지 세 개가 아래 한 줄에 놓입니다. 카드를 누르면 프로젝트마다 하나의 완결된 상세
  페이지로 들어갑니다. 첫 화면을 스크롤하면 Engineering Profile이 이어집니다.

| 경로            | 내용                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| `/`             | Overview(Hero, 프로젝트 카드 4개)와 Engineering Profile                    |
| `/weavegate/`   | 01 Operation · Reproduction · Verification: DB 오류 재현과 변경 검증       |
| `/weavetrail/`  | 02 Finance · AI · Workflow: 공식 발표·시장 데이터로 분석을 확인하는 서비스 |
| `/teampo/`      | 03 Application · State · Transaction: Java/Spring 상태 흐름과 정합성       |
| `/market-scan/` | 04 Trading Data · Performance: 거래 시계열 GPU 정확성 검증과 병목          |

상세 페이지는 상단 `← Overview`로 돌아가고, 하단 pager로 이전·다음 프로젝트로 이동합니다.
마지막 프로젝트의 다음은 Profile입니다.

이 디렉터리는 블로그(Quartz)와 같은 저장소에 있지만 별개의 앱입니다. `portfolio-4dplex`와
같은 라우터·prerender·폰트 검사 구조를 쓰고, 내용과 시각 언어는 따로 설계했습니다.

## 기술 구성

React 19, TypeScript, Vite, CSS Modules. 다이어그램과 차트는 HTML/CSS로 그렸고 런타임 의존성은
`react`와 `react-dom`뿐입니다. 외부 API, 외부 이미지, 웹폰트 CDN을 쓰지 않습니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
cd portfolio-dbinc
npm install
npm run dev       # http://localhost:5173/portfolio-dbinc/
```

## 빌드

```bash
npm run build     # dist/ 생성
npm run preview   # http://localhost:4173/portfolio-dbinc/
```

`npm run build`는 폰트 서브셋 검사 → `tsc --noEmit` → 클라이언트 번들 → SSR 번들 +
`scripts/prerender.mjs` 순서로 실행합니다. prerender는 경로마다 `dist/<경로>/index.html`을 만들고
title, description, canonical, Open Graph 값을 넣습니다. 그래서 GitHub Pages에서 프로젝트 주소로
바로 들어오거나 새로고침해도 그대로 열리고, 브라우저는 같은 마크업을 hydrate한 뒤 History API로
이동합니다.

## 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 Quartz 블로그를 `public/`에 빌드한 뒤 이
디렉터리에서 `npm ci && npm run build`를 실행하고 `dist/`를 `public/portfolio-dbinc/`로 복사합니다.
`vite.config.ts`의 `base`는 `/portfolio-dbinc/`입니다. 배포 주소가 바뀌면 `base`, `index.html`의
Open Graph 주소, `scripts/prerender.mjs`의 `origin`을 함께 고칩니다.

정적 파일 디렉터리는 `static/`입니다(저장소 루트 `.gitignore`가 `public`을 무시하기 때문).

## 주요 파일

```text
portfolio-dbinc/
├── index.html                 메타 태그, Open Graph, 폰트 preload
├── scripts/                   prerender.mjs, font-chars.mjs(+ font-chars.txt)
├── static/                    fonts, favicon.svg, og.png(1200×630)
└── src/
    ├── App.tsx · router.tsx · main.tsx · entry-server.tsx
    ├── styles/global.css      색·서체 토큰
    ├── data/
    │   ├── routes.ts          경로, capability, 페이지별 title·description, 읽는 순서
    │   ├── links.ts           외부 링크 (weavegate 문서는 고정 커밋)
    │   └── marketScan.ts      GPU 실험 측정값
    ├── components/            Nav, Footer, Page(ProjectHeader·Block·Pager), Explorer
    ├── sections/              Overview(Hero + 카드), Profile
    └── projects/              Weavegate, WeaveTrail, TeamPo, MarketScan
```

## 내용을 고칠 때

- **사실과 수치.** 모든 수치는 원본에서 다시 확인한 값입니다.
  - weavegate: 저장소 `docs/quickstart.md`(실제 출력), `docs/experiments/determinism.md`(20+20회,
    40회 8.78초), `fixtures/matching-slice` 설정. 링크는 `data/links.ts`의 커밋에 고정.
  - WeaveTrail: 저장소 README와 제품 개요. 분석 글 확인 화면은 개발 중으로 표시합니다.
  - TeamPo: `Team-po/Server` main의 상태 enum, `MatchService`, Flyway 파일, 워크플로, PR #37·#97.
    "내 구현"은 작성자 커밋이 있는 부분만 표시합니다.
  - GPU: `market_results/e2e_breakdown.csv`, `correctness_gate.csv`, `summary.json`, `env.json`
    (Colab Tesla T4). 값은 `data/marketScan.ts`에 출처와 함께 있습니다.
- **페이지 추가.** `data/routes.ts`에 경로를 넣고 `App.tsx`의 `PAGES`에 연결합니다. 상세 상단 표시,
  pager, prerender가 이 목록을 따릅니다.
- **첫 화면 높이.** 데스크톱 800px 높이 창에서 Hero와 카드 4개가 모두 보이도록 맞췄습니다(1280×800
  기준 마지막 카드 하단 755px). 카드 문구를 늘리면 다시 확인합니다.
- **한글 글자 추가.** Pretendard는 서브셋이라 목록에 없는 글자를 쓰면 빌드가 실패합니다.

  ```bash
  node scripts/font-chars.mjs
  python3 -m venv /tmp/fenv && /tmp/fenv/bin/pip install fonttools brotli
  curl -sL -o /tmp/PretendardVariable.woff2 \
    https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2
  /tmp/fenv/bin/pyftsubset /tmp/PretendardVariable.woff2 \
    --text-file=scripts/font-chars.txt \
    --flavor=woff2 --layout-features='*' \
    --output-file=static/fonts/pretendard-variable-subset.woff2
  ```

- **Open Graph 이미지.** `static/og.png`는 첫 화면 문구를 담은 정적 이미지입니다. 헤드라인을 바꾸면
  함께 교체합니다.
