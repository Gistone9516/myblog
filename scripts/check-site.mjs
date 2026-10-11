// 빌드 결과물 검사 (설계서 V-3, V-4, V-6). 문제가 하나라도 있으면 종료 코드 1
// 출력은 콘솔 인코딩 문제를 피하려고 ASCII로만 쓴다
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gunzipSync } from 'node:zlib';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DIST = join(ROOT, 'dist');
const BASE = '/myblog';
const problems = [];

function walk(dir, filter) {
	const out = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) out.push(...walk(full, filter));
		else if (filter(full)) out.push(full);
	}
	return out;
}

const rel = (p) => relative(ROOT, p).replaceAll('\\', '/');

// 주소가 가리키는 파일이 dist 안에 있는지 확인한다
function targetExists(pathAfterBase) {
	const clean = decodeURIComponent(pathAfterBase.split(/[?#]/)[0]);
	const candidates = clean.endsWith('/')
		? [join(DIST, clean, 'index.html')]
		: [join(DIST, clean), join(DIST, clean, 'index.html'), join(DIST, `${clean}.html`)];
	return candidates.some((c) => existsSync(c));
}

if (!existsSync(DIST)) {
	console.log('FAIL dist not found. Run npm run build first.');
	process.exit(1);
}

// V-3 (B-1, B-8, B-9) 모든 루트 상대 링크는 /myblog 아래이고 대상이 실제로 있다
const htmlFiles = walk(DIST, (f) => f.endsWith('.html'));
let linkCount = 0;
for (const file of htmlFiles) {
	const html = readFileSync(file, 'utf8');
	for (const match of html.matchAll(/\s(?:href|src)="(\/[^"]*)"/g)) {
		const url = match[1];
		if (url.startsWith('//')) continue;
		linkCount++;
		if (url !== BASE && !url.startsWith(`${BASE}/`)) {
			problems.push(`V-3 outside base: ${url} in ${rel(file)}`);
			continue;
		}
		const after = url.slice(BASE.length) || '/';
		if (!targetExists(after)) problems.push(`V-3 broken link: ${url} in ${rel(file)}`);
	}
}

// V-4 (B-2) getCollection은 src/lib/content.ts에서만 부른다
const sourceFiles = walk(join(ROOT, 'src'), (f) => /\.(astro|ts|js|mjs)$/.test(f) && !f.endsWith('.test.ts'));
for (const file of sourceFiles) {
	const text = readFileSync(file, 'utf8');
	if (/\bgetCollection\s*\(/.test(text) && rel(file) !== 'src/lib/content.ts') {
		problems.push(`V-4 getCollection outside adapter: ${rel(file)}`);
	}
}

// V-6 (B-3) 초안 노트는 어디에도 나오지 않는다
const notesDir = join(ROOT, 'src', 'content', 'notes');
const drafts = walk(notesDir, (f) => /\.(md|mdx)$/.test(f))
	.filter((f) => /^draft:\s*true\s*$/m.test(readFileSync(f, 'utf8').split('---')[1] ?? ''))
	.map((f) => ({ id: rel(f).replace(/^src\/content\/notes\//, '').replace(/\.(md|mdx)$/, ''), file: f }));

const textOutputs = walk(DIST, (f) => /\.(html|xml)$/.test(f)).map((f) => [f, readFileSync(f, 'utf8')]);
const pagefindDir = join(DIST, 'pagefind');
const fragments = existsSync(pagefindDir)
	? walk(pagefindDir, (f) => f.endsWith('.pf_fragment')).map((f) => {
			try {
				return gunzipSync(readFileSync(f)).toString('utf8');
			} catch {
				return readFileSync(f).toString('utf8');
			}
		})
	: [];

if (!existsSync(pagefindDir)) problems.push('V-6 pagefind index missing (dist/pagefind)');

for (const draft of drafts) {
	const title = (readFileSync(draft.file, 'utf8').match(/^title:\s*(.+)$/m) ?? [])[1]?.trim();
	if (existsSync(join(DIST, 'notes', draft.id))) problems.push(`V-6 draft page built: notes/${draft.id}`);
	for (const [file, text] of textOutputs) {
		if (text.includes(`/notes/${draft.id}/`) || (title && text.includes(title))) {
			problems.push(`V-6 draft referenced in ${rel(file)}: ${draft.id}`);
		}
	}
	if (title && fragments.some((f) => f.includes(title))) problems.push(`V-6 draft in search index: ${draft.id}`);
}

console.log(
	`check-site: ${htmlFiles.length} pages, ${linkCount} root links, ${sourceFiles.length} source files, ` +
		`${drafts.length} draft(s), ${fragments.length} index fragments`,
);
if (problems.length) {
	for (const p of problems) console.log(`FAIL ${p}`);
	process.exit(1);
}
console.log('OK');
