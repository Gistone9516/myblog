import rss from '@astrojs/rss';
import { loadNotes } from '../lib/content';
import { sortForList } from '../lib/notes';
import { SITE } from '../site.config';
import { withBase } from '../utils/withBase';

// 채널 주소는 /myblog/ (설계서 4장), 노트 주소는 /myblog/notes/<id>/ (B-9)
export async function GET(context) {
	const notes = sortForList(await loadNotes());
	return rss({
		title: SITE.title,
		description: SITE.description,
		site: new URL(withBase('/'), context.site).toString(),
		items: notes.map((note) => ({
			title: note.data.title,
			description: note.data.description,
			pubDate: note.data.date,
			categories: [note.data.category, ...note.data.tags],
			link: withBase(`/notes/${note.id}/`),
		})),
	});
}
