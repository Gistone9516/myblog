// 날짜 표시. 머리말 날짜는 UTC 자정으로 들어오므로 UTC로 읽어야 하루 밀리지 않는다
export function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
