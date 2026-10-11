// 연재 색을 CSS 변수로 바꾼다 (B-16)
// 팔레트 크기는 tokens.css의 --s1 ~ --s5 개수와 같아야 한다. 이 값은 여기에만 둔다
import { seriesColorIndex, slugify } from '../lib/notes';

const SERIES_PALETTE_SIZE = 5;

export function seriesColorVar(seriesName: string): string {
	return `var(--s${seriesColorIndex(slugify(seriesName), SERIES_PALETTE_SIZE) + 1})`;
}
