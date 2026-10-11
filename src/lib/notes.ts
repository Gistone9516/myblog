// 노트 목록을 다루는 도메인 함수 (설계서 C-2)
// Astro를 import하지 않는 순수 함수만 둔다. 그래서 Astro 없이 단위 테스트할 수 있다

export interface NoteData {
	title: string;
	description: string;
	date: Date;
	updated?: Date;
	category: string;
	tags: string[];
	series?: string;
	draft: boolean;
	pinned: boolean;
}

export interface Note {
	id: string;
	data: NoteData;
}

export interface SeriesGroup<T extends Note = Note> {
	name: string;
	slug: string;
	notes: T[];
	latest: Date;
}

export interface CountItem {
	name: string;
	slug: string;
	count: number;
}

export interface ArchiveGroup<T extends Note = Note> {
	year: number;
	month: number;
	notes: T[];
}

export interface SeriesPosition<T extends Note = Note> {
	index: number;
	total: number;
	prev?: T;
	next?: T;
}

const time = (note: Note) => note.data.date.valueOf();
const byDateDesc = (a: Note, b: Note) => time(b) - time(a);
const byDateAsc = (a: Note, b: Note) => time(a) - time(b);
const byKoreanName = (a: string, b: string) => a.localeCompare(b, 'ko');

// 머리말 날짜는 UTC 자정으로 들어오므로 날짜 계산도 UTC 기준으로 한다
const dayKey = (date: Date) => date.toISOString().slice(0, 10);

// B-3 초안은 어디에도 나오지 않는다
export function published<T extends Note>(notes: T[]): T[] {
	return notes.filter((note) => !note.data.draft);
}

// B-4 고정 글 먼저, 그다음 날짜 내림차순
export function sortForList<T extends Note>(notes: T[]): T[] {
	return [...notes].sort(
		(a, b) => Number(b.data.pinned) - Number(a.data.pinned) || byDateDesc(a, b),
	);
}

// B-8 한글과 숫자는 그대로 두고, 영문은 소문자, 공백과 밑줄은 하이픈으로 바꾼다
export function slugify(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-')
		.replace(/[^\p{L}\p{N}-]/gu, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// B-5 연재 안은 오래된 순, 연재 목록은 최근 노트가 있는 순
export function groupBySeries<T extends Note>(notes: T[]): SeriesGroup<T>[] {
	const groups = new Map<string, T[]>();
	for (const note of notes) {
		const name = note.data.series?.trim();
		if (!name) continue;
		groups.set(name, [...(groups.get(name) ?? []), note]);
	}
	return [...groups]
		.map(([name, members]) => {
			const sorted = [...members].sort(byDateAsc);
			return { name, slug: slugify(name), notes: sorted, latest: sorted[sorted.length - 1].data.date };
		})
		.sort((a, b) => b.latest.valueOf() - a.latest.valueOf() || byKoreanName(a.name, b.name));
}

// B-5 연재 안의 순번(1부터)과 앞뒤 노트
export function seriesPosition<T extends Note>(
	note: Note,
	groups: SeriesGroup<T>[],
): SeriesPosition<T> | undefined {
	const name = note.data.series?.trim();
	const group = name ? groups.find((g) => g.name === name) : undefined;
	const index = group ? group.notes.findIndex((n) => n.id === note.id) : -1;
	if (!group || index < 0) return undefined;
	return {
		index: index + 1,
		total: group.notes.length,
		prev: group.notes[index - 1],
		next: group.notes[index + 1],
	};
}

// B-16 연재 색은 순서가 아니라 이름에서 정한다. 연재 순서가 바뀌어도 색이 그대로다
export function seriesColorIndex(slug: string, paletteSize: number): number {
	let hash = 0;
	for (const ch of slug) hash = (hash * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
	return hash % paletteSize;
}

function countByName(names: string[]): CountItem[] {
	const counts = new Map<string, number>();
	for (const raw of names) {
		const name = raw.trim();
		if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return [...counts]
		.map(([name, count]) => ({ name, slug: slugify(name), count }))
		.sort((a, b) => b.count - a.count || byKoreanName(a.name, b.name));
}

// B-8 분류는 노트당 하나, 태그는 여러 개
export function groupByCategory(notes: Note[]): CountItem[] {
	return countByName(notes.map((note) => note.data.category));
}

export function collectTags(notes: Note[]): CountItem[] {
	return countByName(notes.flatMap((note) => note.data.tags));
}

export function byCategory<T extends Note>(notes: T[], slug: string): T[] {
	return notes.filter((note) => slugify(note.data.category) === slug);
}

export function byTag<T extends Note>(notes: T[], slug: string): T[] {
	return notes.filter((note) => note.data.tags.some((tag) => slugify(tag) === slug));
}

// 아카이브는 최신 연월이 먼저, 그 안은 최신 노트가 먼저
export function groupByYearMonth<T extends Note>(notes: T[]): ArchiveGroup<T>[] {
	const groups: ArchiveGroup<T>[] = [];
	for (const note of [...notes].sort(byDateDesc)) {
		const year = note.data.date.getUTCFullYear();
		const month = note.data.date.getUTCMonth() + 1;
		const last = groups[groups.length - 1];
		if (last && last.year === year && last.month === month) last.notes.push(note);
		else groups.push({ year, month, notes: [note] });
	}
	return groups;
}

// B-6 지표는 저장하지 않고 매번 계산한다
export function siteStats(notes: Note[]): { notes: number; series: number; days: number } {
	return {
		notes: notes.length,
		series: groupBySeries(notes).length,
		days: new Set(notes.map((note) => dayKey(note.data.date))).size,
	};
}
