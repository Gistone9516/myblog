import { describe, expect, it } from 'vitest';
import {
	byCategory,
	byTag,
	collectTags,
	groupByCategory,
	groupBySeries,
	groupByYearMonth,
	published,
	seriesColorIndex,
	seriesPosition,
	siteStats,
	slugify,
	sortForList,
	type Note,
} from './notes';

function note(id: string, date: string, extra: Partial<Note['data']> = {}): Note {
	return {
		id,
		data: {
			title: id,
			description: '',
			date: new Date(date),
			category: '기타',
			tags: [],
			draft: false,
			pinned: false,
			...extra,
		},
	};
}

describe('B-3 published', () => {
	it('초안을 뺀다', () => {
		const list = [note('a', '2026-10-01'), note('b', '2026-10-02', { draft: true })];
		expect(published(list).map((n) => n.id)).toEqual(['a']);
	});
});

describe('B-4 sortForList', () => {
	it('고정 글이 먼저이고 나머지는 날짜 내림차순이다', () => {
		const list = [
			note('old', '2026-01-01'),
			note('new', '2026-03-01'),
			note('pinned-old', '2025-01-01', { pinned: true }),
		];
		expect(sortForList(list).map((n) => n.id)).toEqual(['pinned-old', 'new', 'old']);
	});
	it('원본 배열을 바꾸지 않는다', () => {
		const list = [note('a', '2026-01-01'), note('b', '2026-02-01')];
		sortForList(list);
		expect(list.map((n) => n.id)).toEqual(['a', 'b']);
	});
});

describe('B-5 groupBySeries / seriesPosition', () => {
	const list = [
		note('saa-2', '2026-10-05', { series: 'AWS SAA' }),
		note('saa-1', '2026-10-01', { series: 'AWS SAA' }),
		note('log-1', '2026-09-01', { series: 'portfolio-log' }),
		note('single', '2026-10-09'),
	];
	it('연재 안은 오래된 순, 연재 목록은 최근 노트 순이다', () => {
		const groups = groupBySeries(list);
		expect(groups.map((g) => g.name)).toEqual(['AWS SAA', 'portfolio-log']);
		expect(groups[0].notes.map((n) => n.id)).toEqual(['saa-1', 'saa-2']);
		expect(groups[0].latest.toISOString().slice(0, 10)).toBe('2026-10-05');
	});
	it('연재가 없는 노트는 묶이지 않는다', () => {
		expect(groupBySeries([note('x', '2026-01-01')])).toEqual([]);
	});
	it('연재 안의 순번은 1부터 세고 앞뒤 노트를 준다', () => {
		const groups = groupBySeries(list);
		const pos = seriesPosition(list[0], groups);
		expect(pos?.index).toBe(2);
		expect(pos?.total).toBe(2);
		expect(pos?.prev?.id).toBe('saa-1');
		expect(pos?.next).toBeUndefined();
	});
	it('연재가 없으면 undefined', () => {
		expect(seriesPosition(list[3], groupBySeries(list))).toBeUndefined();
	});
});

describe('B-6 siteStats', () => {
	it('노트 수, 연재 수, 서로 다른 날짜 수를 센다', () => {
		const list = [
			note('a', '2026-10-01', { series: 'S' }),
			note('b', '2026-10-01', { series: 'S' }),
			note('c', '2026-10-02'),
		];
		expect(siteStats(list)).toEqual({ notes: 3, series: 1, days: 2 });
	});
});

describe('B-8 slugify / 분류 / 태그', () => {
	it('한글은 그대로, 영문은 소문자, 공백은 하이픈이다', () => {
		expect(slugify('AWS SAA')).toBe('aws-saa');
		expect(slugify(' 네트워크 기초 ')).toBe('네트워크-기초');
		expect(slugify('C++ & Rust!')).toBe('c-rust');
	});
	it('분류와 태그는 글 수 내림차순이고 같으면 이름순이다', () => {
		const list = [
			note('a', '2026-01-01', { category: 'AWS', tags: ['iam', 'scp'] }),
			note('b', '2026-01-02', { category: 'AWS', tags: ['scp'] }),
			note('c', '2026-01-03', { category: 'Astro', tags: ['astro'] }),
		];
		expect(groupByCategory(list)).toEqual([
			{ name: 'AWS', slug: 'aws', count: 2 },
			{ name: 'Astro', slug: 'astro', count: 1 },
		]);
		expect(collectTags(list).map((t) => [t.name, t.count])).toEqual([
			['scp', 2],
			['astro', 1],
			['iam', 1],
		]);
		expect(byCategory(list, 'aws').map((n) => n.id)).toEqual(['a', 'b']);
		expect(byTag(list, 'scp').map((n) => n.id)).toEqual(['a', 'b']);
	});
});

describe('B-16 seriesColorIndex', () => {
	it('같은 이름은 항상 같은 색, 범위 안의 값이다', () => {
		const a = seriesColorIndex('aws-saa', 5);
		expect(seriesColorIndex('aws-saa', 5)).toBe(a);
		expect(a).toBeGreaterThanOrEqual(0);
		expect(a).toBeLessThan(5);
	});
	it('연재 목록의 순서와 무관하다', () => {
		const before = groupBySeries([note('x', '2026-01-01', { series: 'A' }), note('y', '2026-02-01', { series: 'B' })]);
		const after = groupBySeries([note('x', '2026-03-01', { series: 'A' }), note('y', '2026-02-01', { series: 'B' })]);
		expect(before.map((g) => g.name)).not.toEqual(after.map((g) => g.name));
		expect(seriesColorIndex(before.find((g) => g.name === 'A')!.slug, 5)).toBe(
			seriesColorIndex(after.find((g) => g.name === 'A')!.slug, 5),
		);
	});
});

describe('groupByYearMonth', () => {
	it('최신 연월이 먼저이고 그 안은 최신 노트가 먼저다', () => {
		const groups = groupByYearMonth([
			note('sep', '2026-09-30'),
			note('oct-1', '2026-10-01'),
			note('oct-9', '2026-10-09'),
		]);
		expect(groups.map((g) => `${g.year}-${g.month}`)).toEqual(['2026-10', '2026-9']);
		expect(groups[0].notes.map((n) => n.id)).toEqual(['oct-9', 'oct-1']);
	});
});
