# myblog

공부와 작업 기록 중 골라 쓴 노트를 게시하는 블로그다. 여러 블로그 템플릿과 국내외 개발자 블로그를 조사해서 장점만 골라 직접 구현했다. GitHub Pages로 `https://gistone9516.github.io/myblog`에 게시된다.

동작 규칙(B-1~B-17), 계약(C-1~C-4), 검증(V-1~V-6)은 [docs/SPEC.md](docs/SPEC.md)가 단일 출처다.

## 지금 상태

1차 구현 완료. 프로필은 비어 있고(채우면 `src/site.config.ts`만 고치면 된다), 문법 시연용 예시 노트 하나와 초안 확인용 노트 하나가 있다. 실제 노트는 portfolio-log 스킬의 2단계(비공개 노트 중 골라 쓴 글을 공개하는 단계)에서 올라온다.

## 구조

```
src/content/notes/      노트 마크다운. 머리말 형식은 src/content.config.ts
src/lib/content.ts      콘텐츠 어댑터. getCollection을 부르는 유일한 파일
src/lib/notes.ts        도메인 함수 (정렬, 초안 제외, 연재, 분류, 지표). Astro를 모르는 순수 함수
src/lib/notes.test.ts   도메인 단위 테스트
src/components/         화면 조각. 도메인 함수의 결과만 받아 그린다
src/layouts/            페이지 뼈대 (테마 초기화 포함)
src/pages/              라우트: 대표, 노트, 연재, 분류, 태그, 아카이브, 소개, 검색, RSS
src/site.config.ts      사이트 이름, 소개, 프로필, 소셜 링크
src/styles/tokens.css   디자인 토큰의 유일한 위치
src/utils/withBase.ts   내부 링크를 만드는 유일한 함수 (/myblog 붙이기)
scripts/check-site.mjs  빌드 결과물 검사 (링크, 어댑터 경계, 초안 제외)
```

## 노트 쓰기

`src/content/notes/`에 마크다운 파일을 만든다. 파일 이름이 주소가 된다(`/myblog/notes/파일이름/`).

```yaml
title: 제목
description: 목록에 보일 한두 줄 요약
date: 2026-10-11
category: 분류 하나
tags: [태그, 태그]
series: 연재 이름 (선택)
draft: true          # 공개하지 않음 (선택)
pinned: true         # 목록 맨 위에 고정 (선택)
```

코드 블록은 ` ```ts title="파일.ts" {3} ` 처럼 파일 이름과 강조 줄을 지정할 수 있고, `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`은 알림 상자가 된다.

## 실행과 검증

```
npm install
npm run dev       # http://localhost:4321/myblog/ (검색은 빌드 뒤에만 동작)
npm run verify    # 단위 테스트, 빌드와 검색 색인, 결과물 검사
```

- 빌드는 `astro build --force`다. 콘텐츠 캐시가 남아 있으면 코드 블록 설정을 바꾼 뒤 HTML이 지워진 CSS를 가리키는 일이 있었다.
- Node 22.12 이상이 필요하다. 한글이나 공백이 들어간 경로에서는 Node 도구가 실패한 적이 있어서 영문 경로(`C:\Users\USER\dev\blog`)에 둔다.
- main에 push하면 `.github/workflows/deploy.yml`(Astro 공식 워크플로)이 빌드해서 게시한다. 저장소 이름을 바꾸면 `astro.config.mjs`의 `base`와 `scripts/check-site.mjs`의 `BASE`를 같이 바꾼다.
