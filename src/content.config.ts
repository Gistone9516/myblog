import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 노트 머리말 형식 (설계서 C-1). 이 스키마가 원본이다
const notes = defineCollection({
	loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		category: z.string(),
		tags: z.array(z.string()).default([]),
		series: z.string().optional(),
		draft: z.boolean().default(false),
		pinned: z.boolean().default(false),
	}),
});

export const collections = { notes };
