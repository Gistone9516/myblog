---
title: 노트 작성 예시
description: 이 블로그에서 쓸 수 있는 마크다운 문법을 한곳에 모았습니다. 실제 노트가 생기면 지울 예정입니다.
date: 2026-10-11
category: 안내
tags: [마크다운, 예시]
series: 블로그 사용법
---

이 노트는 문법 시연용입니다. 머리말 형식과 본문 문법을 확인하는 데 씁니다.

## 머리말

노트 파일 맨 위에 다음 항목을 적습니다.

- `title`, `description`, `date`, `category`는 꼭 적습니다
- `tags`는 여러 개, `series`는 연재 이름 하나를 적습니다
  - 같은 `series`를 적은 노트끼리 연재로 묶이고, 쓴 날짜 순서로 읽힙니다
- `draft: true`를 적으면 어디에도 공개되지 않습니다
- `pinned: true`를 적으면 목록 맨 위에 고정됩니다

## 코드 블록

파일 이름과 강조할 줄을 지정할 수 있습니다.

```ts title="notes.ts" {3}
export function published(notes) {
  // 초안은 목록에서 뺀다
  return notes.filter((note) => !note.data.draft);
}
```

```bash
npm run verify
```

## 알림 상자

> [!NOTE]
> GitHub와 같은 문법이라 저장소에서 볼 때도 같은 모양으로 보입니다.

> [!TIP]
> 연재 이름을 같게 적으면 대표 화면에 연재 카드가 생깁니다.

> [!WARNING]
> 노트 주소는 파일 이름에서 정해지므로, 공개한 뒤에는 파일 이름을 바꾸지 않는 편이 좋습니다.

## 표

| 머리말 | 필수 | 설명 |
|---|---|---|
| `title` | 예 | 제목 |
| `category` | 예 | 분류 하나 |
| `series` | 아니요 | 연재 이름 |

### 인라인 코드

문장 안에서는 `withBase('/notes/')`처럼 씁니다.
