# myblog 설계서 (1차)

규칙: B-1~B-17 (17건), 계약: C-1~C-4 (4건), 검증: V-1~V-6 (6건)

공부와 작업 기록 중 골라 쓴 노트를 게시하는 개인 블로그다. 여섯 템플릿(AstroPaper, Fuwari, AstroWind, PaperMod, Chirpy, Tailwind Next.js Starter)과 국내외 개발자 블로그 13곳을 조사한 결과에서 장점만 골라 직접 구현한다. 템플릿 코드는 가져오지 않는다.

이 문서가 동작 규칙의 단일 출처다. 코드와 이 문서가 다르면 둘 중 하나를 고친 뒤 같은 commit에 넣는다.

## 1. 계층 구조

```
src/content/notes/*.md        콘텐츠. 머리말 형식은 C-1이 정한다
        │
src/lib/content.ts            어댑터. getCollection을 부르는 유일한 파일 (B-2)
        │  Note[] (평범한 객체)
src/lib/notes.ts              도메인. Astro를 모르는 순수 함수. 정렬, 묶기, 지표 (C-2)
        │
src/components, src/layouts   화면. 도메인 함수의 결과만 받아 그린다
src/pages                     라우트. 어댑터에서 받고 도메인에 넘기고 화면에 그린다

src/site.config.ts            사이트와 프로필 설정의 유일한 위치 (C-3)
src/utils/withBase.ts         내부 링크를 만드는 유일한 함수 (B-1)
src/styles/tokens.css         디자인 토큰의 유일한 위치 (5장)
```

도메인 계층이 Astro를 모르기 때문에 Astro 없이 단위 테스트할 수 있다(V-1). 화면이 콘텐츠를 직접 읽지 않기 때문에, 정렬이나 초안 제외 같은 규칙이 화면마다 따로 구현되지 않는다. 템플릿에서 온 "blog" 이름(폴더, 파일, 상수)은 남기지 않는다.

## 2. 동작 규칙

| ID | 규칙 | 출처 | 이유 | 테스트 |
|---|---|---|---|---|
| B-1 | 모든 내부 링크는 `withBase`를 거친다. | GitHub Pages 프로젝트 저장소라 주소가 `/myblog` 아래다. 측정 2026-10-11: 템플릿의 절대 경로 링크가 전부 깨질 상황이었음 | 링크 하나만 빠져도 그 페이지가 404가 된다 | V-3 |
| B-2 | `getCollection`은 `src/lib/content.ts`에서만 부른다. | 한 결정은 한 곳에서 (verify-fanout §5) | 화면마다 콘텐츠를 직접 읽으면 초안 제외나 정렬이 어딘가에서 빠진다 | V-4 |
| B-3 | `draft: true`인 노트는 목록, 연재, 분류, 태그, 아카이브, RSS, 사이트맵, 검색 색인 어디에도 나오지 않고, 페이지도 만들지 않는다. | AstroPaper의 초안 기능 | 쓰다 만 글이 공개되면 안 된다 | V-1 `published`, V-6 |
| B-4 | 목록 정렬은 고정 글(`pinned`) 먼저, 그다음 날짜 내림차순이다. | Chirpy의 고정 글 | 대표 노트를 맨 위에 둘 수 있어야 한다 | V-1 `sortForList` |
| B-5 | 연재는 머리말의 `series` 값으로 묶고, 연재 안에서는 날짜 오름차순이다. 연재 목록은 가장 최근 노트의 날짜 내림차순이다. 노트 페이지는 연재 안의 순번과 전체 수를 보여준다. | Evans Library의 연재 진열, yceffort의 연재 배지 | 연재는 처음부터 읽는 것이라 오래된 글이 먼저다 | V-1 `groupBySeries`, `seriesPosition` |
| B-6 | 지표는 노트 수, 연재 수, 기록한 날 수(서로 다른 날짜의 수)다. 저장하지 않고 매 빌드마다 계산한다. 소개 페이지에 문장 한 줄로 보여주고, 대표 화면에는 글 수만 탭 배지로 보여준다. | yceffort의 숫자 지표. 위치는 hudi.blog 형식 적용 2026-10-11 | 저장한 숫자는 실제 노트와 어긋난다 (work-rules-diagnosis DG-3) | V-1 `siteStats` |
| B-7 | 프로필(이름, 한 줄 소개, 소개 문단, 지금 공부 중 배지, 소셜 링크)은 `site.config.ts` 한 곳에 있다. 값이 비어 있으면 그 요소를 그리지 않는다. 빈칸을 채우는 문구를 지어 넣지 않는다. 프로필이 모두 비면 대표 화면 제목은 사이트 이름이다. | 사용자 2026-10-11: "당장은 비워둔 상태로 진행" | 자리만 차지하는 가짜 소개가 공개되면 안 된다 | V-5 (빈 상태 화면) |
| B-8 | 분류는 노트당 하나(`category`), 태그는 여러 개(`tags`)다. 분류와 태그의 주소 조각은 `slugify`가 만든다. 분류와 태그는 각각 색인 페이지가 있다. | Chirpy와 토스의 분류, 국내외 공통 칩. 색인 페이지는 디자인 검토 2026-10-11 | 분류는 서가, 태그는 색인이다. 칩이 가리키는 곳을 모아 보는 화면이 있어야 한다 | V-1 `slugify`, `groupByCategory`, V-3 |
| B-9 | 노트 주소는 `/myblog/notes/<id>/`다. | 템플릿의 `/blog/blog/` 중복을 없앤다 | 주소는 한번 공개되면 바꾸기 어렵다 | V-3 |
| B-10 | 검색은 Pagefind 정적 색인이다. 빌드 뒤에 색인을 만들고, 노트 레이아웃의 본문(`data-pagefind-body`)만 색인한다. 색인은 `/myblog/pagefind/`에서 불러온다. | AstroPaper, Fuwari | 서버 없이 전체 노트를 찾을 수 있어야 한다. 개발 서버에는 색인이 없어 빌드 뒤에만 확인된다 | V-6 |
| B-11 | 코드 블록은 Expressive Code로 그린다. 파일명, 줄 강조, 복사 버튼을 지원하고, 배경은 사이트 표면색에 맞춘다. | Fuwari(Expressive Code), PaperMod 복사 버튼 | 코드가 많은 공부 노트. 코드 블록만 다른 색 종이처럼 뜨면 안 된다 | V-5 |
| B-12 | `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]` 형식의 인용문은 알림 상자로 그린다. 색은 디자인 토큰만 쓴다. | Fuwari, Tailwind Next.js Starter | GitHub 문법이라 저장소에서도 같게 보인다. 토큰만 쓰면 다크 모드를 따로 처리하지 않아도 된다 | V-5 |
| B-13 | 테마는 시스템, 밝게, 어둡게 세 상태다. 처음에는 시스템을 따르고, 고르면 기억한다. 페이지가 그려지기 전에 `<html data-theme>`를 정해서 깜빡이지 않는다. 코드 블록도 같은 속성으로 바뀐다. | 여섯 템플릿 공통. 세 상태는 디자인 검토 2026-10-11 | 두 상태면 한번 고른 뒤 시스템 설정으로 돌아갈 방법이 없다 | V-5 |
| B-14 | 노트 페이지는 h2, h3로 목차를 만든다. 넓은 화면에서는 본문 옆에 붙어 있고, 좁은 화면에서는 본문 위에 `<details>`로 접혀 있다. | Chirpy, AstroPaper | 긴 공부 노트를 훑어 이동할 수 있어야 한다. `<details>`는 스크립트 없이 접힌다 | V-5 |
| B-15 | 한글 본문은 `word-break: keep-all`과 `overflow-wrap: break-word`, 코드와 주소는 `overflow-wrap: anywhere`다. 본문 폭은 `41rem`(17px에서 한글 약 43자)이다. 코드 글꼴 스택에 한글을 지원하는 고정폭 글꼴을 넣는다. | 디자인 검토 2026-10-11 | 지정하지 않으면 좁은 화면에서 어절 중간이 끊기고, 코드 속 한글 주석의 폭이 어긋난다 | V-5 |
| B-16 | 연재 색은 연재 이름(slug)의 해시로 정한다. 같은 연재는 연재 페이지 카드와 노트 페이지 표시에서 같은 색이다. | 디자인 검토 2026-10-11 (두 에이전트가 따로 같은 결론) | 순서로 정하면 새 노트가 올라와 연재 순서가 바뀔 때 색도 바뀐다 | V-1 `seriesColorIndex` |
| B-17 | 키보드 포커스는 `:focus-visible`에 강조색 2px 외곽선으로 보인다. `prefers-reduced-motion`이면 움직임을 끈다. | 디자인 검토 2026-10-11, frontend-design 품질 하한 | 키보드 사용자가 위치를 잃지 않아야 한다 | V-5 |

## 3. 계약

### C-1 노트 머리말 (`src/content.config.ts`의 스키마가 원본)

```ts
title: string           // 제목
description: string     // 목록에 보일 한두 줄 요약
date: Date              // 작성일
updated?: Date          // 수정일
category: string        // 분류 하나 (B-8)
tags: string[]          // 기본값 []
series?: string         // 연재 이름 (B-5)
draft: boolean          // 기본값 false (B-3)
pinned: boolean         // 기본값 false (B-4)
```

### C-2 도메인 함수 (`src/lib/notes.ts`, Astro를 import하지 않는다)

```ts
type Note = { id: string; data: NoteData }   // NoteData = C-1

published(notes: Note[]): Note[]                         // B-3
sortForList(notes: Note[]): Note[]                       // B-4
groupBySeries(notes: Note[]): SeriesGroup[]              // B-5
seriesPosition(note: Note, groups: SeriesGroup[]): { index: number; total: number; prev?: Note; next?: Note } | undefined  // B-5, 1부터 셈
seriesColorIndex(slug: string, paletteSize: number): number  // B-16
groupByCategory(notes: Note[]): CountItem[]              // B-8, 글 수 내림차순, 같으면 이름순
collectTags(notes: Note[]): CountItem[]                  // B-8, 글 수 내림차순, 같으면 이름순
byCategory(notes: Note[], slug: string): Note[]          // B-8, 분류 slug가 같은 노트
byTag(notes: Note[], slug: string): Note[]               // B-8, 태그 slug 중 하나가 같은 노트
groupByYearMonth(notes: Note[]): ArchiveGroup[]          // 아카이브, 최신 먼저
siteStats(notes: Note[]): { notes: number; series: number; days: number }  // B-6
slugify(name: string): string                            // 한글은 그대로, 영문은 소문자, 공백은 -

type SeriesGroup  = { name: string; slug: string; notes: Note[]; latest: Date }
type CountItem    = { name: string; slug: string; count: number }
type ArchiveGroup = { year: number; month: number; notes: Note[] }
```

### C-3 사이트 설정 (`src/site.config.ts`)

```ts
SITE = {
  title: string,            // 사이트 이름 (짧게. 360px 헤더에 메뉴와 같이 들어가야 한다)
  description: string,      // 사이트 소개 한 줄. 검색 결과, RSS, 프로필이 빈 대표 화면에 쓴다
  profile: {
    name: string,           // 비어 있으면 그리지 않음 (B-7)
    oneLiner: string,
    intro: string,
    focus: string[],        // 화면 문구는 "지금 공부 중"
  },
  socials: { github?: string; email?: string },
}
```

### C-4 링크 (`src/utils/withBase.ts`)

`withBase(path: string): string`. 앞에 `/myblog`를 붙인다.

## 4. 페이지

| 주소 (`/myblog` 아래) | 내용 |
|---|---|
| `/` | 대표 화면 (5장) |
| `/notes/` | 전체 노트 목록 (B-4). 위쪽에 분류 색인과 태그 색인으로 가는 링크 |
| `/notes/<id>/` | 노트 본문, 목차(B-14), 같은 연재의 이전과 다음 노트 |
| `/series/`, `/series/<slug>/` | 연재 목록, 연재 하나의 노트들 (B-5) |
| `/categories/`, `/categories/<slug>/` | 분류 색인, 분류별 노트 (B-8) |
| `/tags/`, `/tags/<slug>/` | 태그 색인, 태그별 노트 (B-8) |
| `/archive/` | 연도와 월별 노트 |
| `/about/` | 소개. 프로필이 비어 있으면 아직 비어 있다고만 적는다 (B-7) |
| `/search/` | 검색 (B-10) |
| `/rss.xml`, 사이트맵, 404 | 채널 주소는 `/myblog/` |

상단 바는 아이콘(테마, 태그, 연재, RSS, 검색)만 두고, 아카이브와 분류는 소개 페이지와 노트 목록에서 연결한다. 같은 대상은 아이콘 이름, 제목, 칩에서 같은 말로 부른다. "블로그"라는 말은 사이트 소개에만 쓴다.

## 5. 화면 설계

기준 디자인은 hudi.blog다. 사용자 2026-10-11: "아까 먹었던 페이지 중에 괜찮은 무난한 하나를 골라서 적용해줘". 조사한 사례 중 목적("꾸준히, 의미있는 학습을 기록하기 위한 공간")이 가장 같고, 흰 바탕과 회색 칩의 가장 무난한 국내 개발 블로그 형식이라 골랐다. 앞서 직접 설계한 청록 잉크 색과 대표 화면의 연재 카드는 "디자인이 아직 별로"라는 평가로 걷어냈다.

### 대표 화면 (폭 680px)

```
사이트이름(고정폭 굵게)                      테마 태그 연재 RSS 검색
─────────────────────────────────────────────────── (옅은 그림자)
@이름 또는 사이트이름                   ← B-7: 프로필이 비면 사이트 이름
한 줄 소개 또는 사이트 소개

                 [글 12]    소개                ← 가운데 탭, 활성 탭에 밑줄
───────────────────────────────────────────────────
제목 (28px 굵게)
2026-10-05
요약 두세 줄 (회색)
(분류) (태그) (태그)                    ← 회색 바탕 둥근 칩
───────────────────────────────────────────────────
...
```

- 글 수는 탭 배지로 보여준다. 노트 수, 연재 수, 기록한 날 수의 지표 문장(B-6)은 소개 페이지에 있다.
- 연재 카드는 연재 페이지에만 있다.

### 노트 페이지 (본문 41rem)

```
제목 (40px 굵게)                               │ 목차 (sticky)
2026-10-05   ▌AWS SAA 3/5                     │ 배경
(분류) (태그) (태그)                            │ SCP는...
──────────────────────────────                │   상속
본문, 코드 블록 (B-11), 알림 상자 (B-12)          │
[이전 노트 카드]   [다음 노트 카드]               │
```

### 디자인 토큰

값은 `src/styles/tokens.css`에만 있다. 여기에 다시 적지 않는다(두 곳에 적으면 디자인을 바꿀 때 한쪽만 바뀐다). 코드 블록 색은 Expressive Code 설정이 실제 색 값을 요구해서 `astro.config.mjs`에 토큰과 같은 값을 적고, 그 옆에 어느 토큰과 같아야 하는지 주석을 단다.

- 대비: 보조 글자색과 배경은 밝은 화면 약 4.7:1, 어두운 화면 약 7.2:1 (2026-10-11 계산). 둘 다 AA(4.5:1) 이상이다. 연재 색 5개는 글자색이 아니라 작은 마크의 면 색이다.
- 글꼴: 본문과 UI는 Pretendard(OFL 1.1) 동적 서브셋을 자체 호스팅한다. 사이트 이름은 고정폭 글꼴이다. 코드는 고정폭 글꼴 스택이고 한글 폴백을 넣는다(B-15). 인라인 코드는 0.9em.
- 움직임은 테마 전환과 목차 펼침처럼 사용자의 조작에 답하는 것만 둔다(B-17).

## 6. 검증

| ID | 무엇을 | 어떻게 |
|---|---|---|
| V-1 | 도메인 규칙 B-3~B-6, B-8, B-16 | `src/lib/notes.test.ts` 단위 테스트 (vitest). 테스트 이름에 규칙 ID를 넣는다 |
| V-2 | 빌드 | `npm run build` 성공 (Astro 빌드 뒤 Pagefind 색인까지). 빌드는 항상 `astro build --force`로 콘텐츠 캐시를 비운다. 측정 2026-10-11: 캐시가 바뀌지 않은 노트의 렌더링 결과를 재사용해서, 코드 블록 설정을 바꾼 뒤 HTML이 지워진 옛 CSS 파일을 가리켰다(V-3이 잡음) |
| V-3 | 링크 B-1, B-8, B-9 | `scripts/check-site.mjs`: `dist`의 모든 HTML에서 `/myblog` 밖을 가리키는 루트 상대 링크가 0건인지, 내부 링크의 대상 파일이 실제로 있는지 |
| V-4 | B-2 | 같은 스크립트: `getCollection` 호출이 `src/lib/content.ts`에만 있는지 |
| V-5 | 화면 B-7, B-11~B-15, B-17 | 대표 화면, 노트, 목록을 밝은 화면과 어두운 화면, 넓은 화면과 좁은 화면(360px)에서 스크린샷으로 확인 |
| V-6 | B-3, B-10 | 초안 노트를 하나 두고 빌드한 뒤 `dist`와 검색 색인에 그 노트가 없는지 같은 스크립트로 확인 |

## 7. 확인한 의존성 (2026-10-11, npm 레지스트리와 공식 문서)

| 패키지 | 버전 | 근거 |
|---|---|---|
| astro-expressive-code | 0.44.2, MIT | peerDependencies에 `astro ^7.0.0`. 테마 전환은 `themeCssSelector`로 `data-theme` 속성에 맞춘다 (공식 문서 themes 가이드) |
| remark-github-blockquote-alert | 2.1.0, MIT | GitHub 알림 문법 |
| pagefind | 1.5.2, MIT | 빌드 뒤 `pagefind --site dist` |
| pretendard | 1.3.9, OFL-1.1 | 자체 호스팅 가능 |
| vitest | 5.0.3 | peer `vite ^6.4 / ^7 / ^8`, 설치된 Vite는 8.3.4 |

## 8. 범위 밖 (2차)

수식, Mermaid 다이어그램, 관련 노트 추천, 댓글, 계층형 분류, 읽는 시간, 노트별 OG 이미지.

## 9. 콘텐츠

- 영어 샘플 글은 지운다.
- 기능 시연용 한국어 예시 노트 하나를 둔다. 개인 이야기가 아닌 문법 시연용이다. 실제 노트가 생기면 지운다.
- V-6을 위한 초안 노트 하나를 둔다.
- 프로필과 첫 연재 이름은 사용자가 채울 때까지 비워 둔다 (B-7).
