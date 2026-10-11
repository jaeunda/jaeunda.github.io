# portfolio-hyundai-autoever

세 가지 대표 프로젝트로 데이터 처리의 신뢰성, 검증 자동화, 연산 성능, AI 출력 통제를 보여 주는 웹
포트폴리오입니다. 사이트 안의 문구는 특정 기업이나 직무를 언급하지 않습니다.

- 배포 주소: <https://jaeunda.github.io/portfolio-hyundai-autoever/>
- 첫 화면: 한 문장과 대표 프로젝트 3개. 1280×800 창에서 세 카드가 스크롤 없이 모두 보입니다. 스크롤하면
  프로필(소개, Additional Work, Technical Toolkit, Education & Learning)이 이어집니다.

| 경로                      | 내용                                                           |
| ------------------------- | -------------------------------------------------------------- |
| `/`                       | 대표 프로젝트 3개와 프로필                                     |
| `/weavegate/`             | 01 DB 정합성 검증 자동화 (Go, MySQL, GitHub Actions)           |
| `/surveillance-frontier/` | 02 탐지 정책 검증용 대용량 데이터 처리 엔진 (C++/OpenMP, CUDA) |
| `/weavetrail/`            | 03 이종 데이터 표준화와 AI 출력 품질 검증 (TypeScript)         |

상세 페이지는 문제 → 해결 과정 → 설계 판단 → 검증 결과 → 실무 적용 순서입니다. 상단 바에는
`← 전체 프로젝트`와 세 프로젝트 전환 탭(현재 프로젝트 표시)이 있고, 하단 pager는 다음 프로젝트의 제목과 한
문장 미리보기를 보여 줍니다. 마지막 프로젝트의 다음은 프로필입니다.

## 기술 구성

React 19, TypeScript, Vite, CSS Modules. `portfolio-dbinc`의 라우터·prerender·폰트 검사 구조를 그대로
쓰고, 화면과 내용은 새로 만들었습니다. 다이어그램은 인라인 SVG와 HTML/CSS이며 런타임 의존성은 `react`와
`react-dom`뿐입니다. 외부 스크립트, 외부 이미지, 웹폰트 CDN을 쓰지 않습니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
cd portfolio-hyundai-autoever
npm install
npm run dev       # http://localhost:5173/portfolio-hyundai-autoever/
```

배포와 같은 결과물(prerender 포함)을 확인하려면:

```bash
npm run build     # dist/ 생성
npm run preview   # http://localhost:4173/portfolio-hyundai-autoever/
```

`npm run build`는 폰트 서브셋 검사 → `tsc --noEmit` → 클라이언트 번들 → SSR 번들 + `scripts/prerender.mjs`
순서로 실행합니다. prerender는 경로마다 `dist/<경로>/index.html`을 만들고 title, description, canonical,
Open Graph 값을 넣습니다. 그래서 GitHub Pages에서 프로젝트 주소로 바로 들어오거나 새로고침해도 열리고,
브라우저는 같은 마크업을 hydrate한 뒤 History API로 이동합니다. 뒤로 가기는 떠났던 위치로 스크롤을
되돌립니다.

## 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 Quartz 블로그를 빌드한 뒤 이 디렉터리에서
`npm ci && npm run build`를 실행하고 `dist/`를 `public/portfolio-hyundai-autoever/`로 복사합니다.
`vite.config.ts`의 `base`가 `/portfolio-hyundai-autoever/`입니다. 주소가 바뀌면 `base`, `index.html`의 Open
Graph 주소, `scripts/prerender.mjs`의 `origin`을 함께 고칩니다. 정적 파일 디렉터리는 `static/`입니다.

## 주요 파일

```text
portfolio-hyundai-autoever/
├── index.html                 메타 태그, Open Graph, 폰트 preload
├── scripts/                   prerender.mjs, font-chars.mjs(+ font-chars.txt)
├── static/                    fonts, favicon.svg, og.png(1200×630)
└── src/
    ├── App.tsx · router.tsx · main.tsx · entry-server.tsx
    ├── styles/global.css      색·서체 토큰
    ├── data/routes.ts         경로, 페이지별 title·description, 다음 프로젝트 미리보기
    ├── data/links.ts          외부 링크 (문서는 고정 커밋)
    ├── diagrams/              홈 카드 다이어그램(Minis.tsx), SVG 색(palette.ts)
    ├── components/            Nav, Footer, Page(ProjectHeader·Section·Figure·Decisions·Apply·Pager)
    ├── sections/              Overview(첫 화면), Profile
    └── projects/              Weavegate, SurveillanceFrontier, WeaveTrail
```

## 내용을 고칠 때

- **수치의 출처.** 문서 링크는 `data/links.ts`의 커밋에 고정되어 있고, 페이지의 수치는 그 커밋의 문서에서
  가져왔습니다.
  - weavegate (`36f3f4f`): `docs/experiments/baseline-comparison.md`(방법별 탐지 횟수),
    `spring-replay.md`(취약·수정 20/20), `exploration.md`, `gate-run-time.md`(85–129초), 적용 예제 README.
  - surveillance-frontier (`84b6e2d`): `docs/phase1.md`(349배는 N = 604,800, K = 15, 정책 1개, 1스레드,
    AWS c7i.16xlarge 조건; 과제 시간은 투영값), `experiments/phase2-gpu/README.md`(설계 r2.1, 측정 없음).
    **GPU 성능 수치는 Phase 2 측정 전까지 쓰지 않습니다.**
  - WeaveTrail (`892e4d3`): `docs/EVALUATION.ko.md`(채택 기준, 2026-10-08 복구 세션, `NO_MODEL`),
    `docs/ARCHITECTURE.ko.md`(결정성 계약). `NO_MODEL`을 채택된 모델이나 검증된 정확도로 쓰지 않고, 사이트 문구에는 구현한 품질 기준과 자동 판정만 씁니다.
  - TeamPo는 작성자 커밋이 있는 부분만 "내 구현"으로, CarryCheck는 교육 과정 팀 프로젝트로 표시합니다.
- **공개 정보.** 이름과 GitHub만 씁니다. 연락처, 성적, 어학 점수, 지원 기업·직무는 넣지 않습니다.
- **첫 화면 높이.** 1280×800에서 세 카드의 하단이 약 650px입니다. 카드 문구를 늘리면 다시 확인합니다.
- **모바일 다이어그램.** surveillance-frontier의 큰 SVG 두 개는 640px 이하에서 좁은 화면용 그림으로
  바뀝니다(`svgWide`/`svgNarrow`). 글자를 줄이는 대신 배치를 바꿉니다.
- **한글 글자 추가.** Pretendard는 서브셋이라 목록에 없는 글자를 쓰면 빌드가 실패합니다. 소스 안의 한글
  정규식 범위도 글자로 취급되므로 `가-힣`처럼 이스케이프로 씁니다.

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

- **Open Graph 이미지.** `static/og.png`는 첫 화면 문구와 세 프로젝트 이름을 담은 정적 이미지입니다.
  헤드라인을 바꾸면 함께 교체합니다.
