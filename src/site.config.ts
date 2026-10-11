// 사이트와 프로필 설정의 유일한 위치 (설계서 C-3)
// 프로필은 비어 있으면 화면에 그리지 않는다 (B-7). 채울 때는 여기만 고치면 된다
export const SITE = {
	title: 'myblog',
	description: '공부와 작업 기록 중 골라 쓴 노트를 모아 두는 곳',
	profile: {
		name: '',
		oneLiner: '',
		intro: '',
		focus: [] as string[],
	},
	socials: {
		github: '',
		email: '',
	},
};

export const hasProfile = Boolean(
	SITE.profile.name || SITE.profile.oneLiner || SITE.profile.intro || SITE.profile.focus.length,
);
