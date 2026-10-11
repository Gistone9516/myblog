// 사이트가 저장소 이름 아래(/myblog)에 게시되므로 내부 링크 앞에 base 경로를 붙인다
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
	return base + (path.startsWith('/') ? path : '/' + path);
}
