// 사이트가 저장소 이름 아래(/myblog)에 게시되므로 내부 링크 앞에 base 경로를 붙인다 (설계서 B-1, C-4)
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
	return base + (path.startsWith('/') ? path : '/' + path);
}

// 현재 주소에서 base를 뗀 경로. 메뉴의 현재 위치 표시에 쓴다
export function stripBase(pathname: string): string {
	return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}
