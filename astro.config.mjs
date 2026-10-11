// @ts-check

import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { defineConfig } from 'astro/config';
import { remarkAlert } from 'remark-github-blockquote-alert';

// https://astro.build/config
export default defineConfig({
	site: 'https://gistone9516.github.io',
	// 저장소 이름 아래에 게시된다. 저장소 이름을 바꾸면 여기와 README를 같이 바꾼다 (설계서 B-1)
	base: '/myblog',
	integrations: [
		// B-11 코드 블록. 사이트의 data-theme 속성으로 밝게, 어둡게가 바뀐다 (B-13)
		expressiveCode({
			themes: ['github-light', 'github-dark'],
			themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
			useDarkModeMediaQuery: false,
			styleOverrides: {
				borderRadius: '10px',
				// tokens.css의 --surface와 같은 값. 코드 블록만 다른 종이처럼 뜨지 않게 한다
				codeBackground: ['#1a2123', '#fbfdfb'],
				borderColor: ['#2a3436', '#dfe7e2'],
				codeFontFamily:
					"'JetBrains Mono', 'Cascadia Code', Consolas, 'D2Coding', 'Noto Sans Mono CJK KR', monospace",
				uiFontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif",
				// 그림자 없이 선으로만 구분한다 (설계서 5장)
				frames: {
					frameBoxShadowCssValue: 'none',
					editorActiveTabIndicatorTopColor: ['#7db3ae', '#2e6a6e'],
				},
				// 강조 줄은 사이트 강조색을 쓴다 (tokens.css의 --accent-bg, --accent)
				textMarkers: { markBackground: ['#213735', '#dceae6'], markBorderColor: ['#7db3ae', '#2e6a6e'] },
			},
		}),
		mdx(),
		sitemap(),
	],
	markdown: {
		// B-12 > [!NOTE] 형식의 인용문을 알림 상자로 바꾼다
		// Astro 7의 기본 처리기는 remark 플러그인을 받지 않아서 unified 처리기를 명시한다
		processor: unified({ remarkPlugins: [remarkAlert] }),
	},
});
