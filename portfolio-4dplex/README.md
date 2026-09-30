# portfolio-4dplex

CJ 4DPLEX 2026 하반기 신입사원 S/W개발 직무 지원용 웹 포트폴리오입니다.

- 배포 주소: <https://jaeunda.github.io/portfolio-4dplex/>
- 첫 화면은 전체 요약과 프로필입니다. 프로젝트마다 별도 페이지가 있고 첫 화면의 카드나 상단
  내비게이션으로 들어갑니다. 각 프로젝트 페이지에는 첫 화면으로 돌아가는 링크와 이전·다음
  프로젝트 링크가 있습니다.

| 경로           | 내용                                                          |
| -------------- | ------------------------------------------------------------- |
| `/`            | Overview(핵심 메시지, 세 가지 역량, 대표 성과)와 Profile      |
| `/ongi/`       | 01 Integration & Control: 전체 구조, 제어 충돌, 상태 관리     |
| `/weavegate/`  | 02 Reproduction & Verification: 검증 파이프라인, 구현, 결과   |
| `/cuda/`       | 03 Performance: 최적화 과정, 제출 코드, 처리량과 정확성       |
| `/foundation/` | 04 Systems Foundation: xv6 커널 확장, Linux 시스템 프로그래밍 |

이 디렉터리는 블로그(Quartz)와 같은 저장소에 있지만 별개의 앱입니다. 의존성, 빌드,
타입 검사가 모두 이 디렉터리 안에서 끝납니다.

## 기술 구성

React 19, TypeScript, Vite, CSS Modules. 다이어그램은 HTML/CSS와 인라인 SVG로 그렸고,
런타임 의존성은 `react`와 `react-dom`뿐입니다. 외부 API, 데이터베이스, 외부 이미지와
웹폰트 CDN을 쓰지 않습니다.

## 로컬 실행

Node.js 22 이상이 필요합니다.

```bash
cd portfolio-4dplex
npm install
npm run dev
```

<http://localhost:5173/portfolio-4dplex/> 에서 확인합니다.

## 빌드

```bash
npm run build     # dist/ 생성
npm run preview   # http://localhost:4173/portfolio-4dplex/
```

`npm run build`는 다음을 순서대로 실행합니다.

1. `scripts/font-chars.mjs --check`: 본문에 폰트 서브셋에 없는 글자가 있으면 실패합니다.
2. `tsc --noEmit`: 타입 검사
3. `vite build`: 클라이언트 번들
4. `vite build --ssr` + `scripts/prerender.mjs`: 모든 경로를 정적 HTML로 렌더링합니다.
   `dist/index.html`과 `dist/<경로>/index.html`이 만들어지고 경로마다 title, description,
   canonical, Open Graph 값이 들어갑니다. 첫 화면이 JavaScript를 기다리지 않고, 프로젝트
   주소로 바로 들어오거나 새로고침해도 GitHub Pages에서 그대로 열립니다. 브라우저에서는 같은
   마크업을 hydrate하고 이후 페이지 이동은 History API로 처리합니다.

## GitHub Pages 배포

저장소 `jaeunda/jaeunda.github.io`의 `main`에 push하면
`.github/workflows/deploy.yml`이 다음을 수행합니다.

1. Quartz 블로그를 `public/`에 빌드
2. 이 디렉터리에서 `npm ci && npm run build`
3. `portfolio-4dplex/dist/`를 `public/portfolio-4dplex/`로 복사
4. `public/`을 GitHub Pages에 배포

하위 경로에서 동작하도록 `vite.config.ts`의 `base`가 `/portfolio-4dplex/`로 설정돼
있습니다. CSS의 폰트 경로와 `index.html`의 아이콘·preload 경로는 Vite가 이 값을 붙여
다시 쓰고, 내부 링크는 `router.tsx`의 `Link`가 붙입니다. 배포 주소가 바뀌면 `base`와 함께
`index.html`의 Open Graph 이미지 주소, `scripts/prerender.mjs`의 `origin`을 수정해야 합니다.

정적 파일 디렉터리는 Vite 기본값인 `public/`이 아니라 `static/`입니다. 저장소 루트의
`.gitignore`가 Quartz 출력물인 `public`을 모든 깊이에서 무시하기 때문입니다.

## 주요 파일 구조

```text
portfolio-4dplex/
├── index.html                 메타 태그, Open Graph, 폰트 preload
├── vite.config.ts             base 경로, 정적 디렉터리
├── scripts/
│   ├── prerender.mjs          빌드 후 경로별 정적 HTML 생성
│   ├── font-chars.mjs         폰트 서브셋 글자 목록 생성·검사
│   └── font-chars.txt         Pretendard 서브셋을 만든 글자 목록
├── static/                    그대로 복사되는 파일 (fonts, favicon.svg, og.png)
└── src/
    ├── main.tsx               브라우저 진입점 (hydrate)
    ├── entry-server.tsx       prerender 진입점
    ├── App.tsx                경로별 페이지 조립
    ├── router.tsx             History API 라우터, Link
    ├── styles/global.css      색·서체 토큰, 기본 스타일
    ├── data/
    │   ├── routes.ts          경로, 내비게이션 이름, 페이지별 title·description
    │   ├── links.ts           모든 외부 링크 (소스 발췌는 고정 커밋)
    │   ├── excerpts.ts        공개 저장소에서 그대로 옮긴 코드·설정 발췌
    │   └── cudaExcerpts.ts    DLI 최종 평가 제출 코드 발췌
    ├── components/
    │   ├── Nav                상단 고정 내비게이션
    │   ├── Section            페이지 머리, 요약, 구성 목차, 번호 블록, 직무 접점, 이전·다음
    │   ├── StepExplorer       단계를 선택해 세부를 보는 다이어그램 (loop / rail / row)
    │   ├── ControlPath        Ongi 제어 경로 통합 다이어그램
    │   ├── Tabs               탭, 두 상태 전환 스위치
    │   ├── Detail             선택한 단계의 본문
    │   └── CodeBlock          출처 링크가 달린 코드 발췌
    └── sections/              Overview, Ongi, Weavegate, Cuda, Foundation, Profile, Footer
```

## 내용을 고칠 때

- **사실과 수치.** 페이지의 수치와 코드 발췌는 공개 저장소와 그 문서에서 확인한
  값입니다. `data/excerpts.ts`는 원본 파일의 줄 범위를 그대로 옮긴 것이고
  `data/links.ts`의 커밋에 고정돼 있습니다. 발췌를 바꾸면 두 파일을 함께 고칩니다.
  CUDA 페이지의 처리량은 DLI 최종 평가 노트북의 자동 검증 출력에서 가져왔습니다.
- **페이지 추가.** `data/routes.ts`에 경로를 추가하고 `App.tsx`의 `PAGES`에 컴포넌트를
  연결합니다. 내비게이션, 이전·다음 링크, prerender가 이 목록을 따릅니다.
- **한글 글자 추가.** Pretendard는 서브셋이라, 목록에 없는 글자를 쓰면 빌드가 실패합니다.
  목록을 다시 만들고 폰트를 다시 자릅니다.

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

- **Open Graph 이미지.** `static/og.png`(1200×630)는 첫 화면의 문구를 담은 정적
  이미지입니다. 헤드라인을 바꾸면 함께 교체합니다.
