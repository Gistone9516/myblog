// 콘텐츠 어댑터. getCollection을 부르는 유일한 파일이다 (설계서 B-2)
// 화면과 라우트는 이 파일을 거쳐서만 노트를 받는다
import { getCollection, render, type CollectionEntry } from 'astro:content';
import { published } from './notes';

export type NoteEntry = CollectionEntry<'notes'>;

// B-3 초안은 여기서 걸러서 어떤 화면에도 넘어가지 않는다
export async function loadNotes(): Promise<NoteEntry[]> {
	return published(await getCollection('notes'));
}

export function renderNote(entry: NoteEntry) {
	return render(entry);
}
