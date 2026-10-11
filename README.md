# myblog

공부와 작업 기록 중 골라 쓴 글을 게시하는 블로그다. Astro 공식 블로그 템플릿으로 만들었고, GitHub Pages로 `https://gistone9516.github.io/myblog`에 게시된다.

## 지금 상태

템플릿의 샘플 글을 그대로 둔 초기 상태다. 실제 글은 portfolio-log 스킬의 2단계(비공개 노트 중 골라 쓴 글을 공개하는 단계)에서 올라온다.

## 구조

- `src/content/blog/`: 글 (마크다운, MDX). 글 주소는 `/myblog/blog/글이름/`이다
- `src/pages/`: 페이지
- `src/utils/withBase.ts`: 내부 링크 앞에 `/myblog`를 붙이는 함수. 저장소 이름 아래에 게시되기 때문에 모든 내부 링크가 이 함수를 거쳐야 한다
- `astro.config.mjs`: `site`와 `base`(`/myblog`) 설정. 저장소 이름을 바꾸면 `base`도 같이 바꾼다
- `.github/workflows/deploy.yml`: main에 push하면 빌드해서 Pages에 게시한다 (Astro 공식 문서의 워크플로 그대로)

## 실행

```
npm install
npm run dev      # http://localhost:4321/myblog/
npm run build    # dist/ 에 결과물
```

Node 22.12 이상이 필요하다. 한글이나 공백이 들어간 경로에서는 Node 도구가 실패한 적이 있어서 영문 경로(`C:\Users\USER\dev\blog`)에 둔다.
