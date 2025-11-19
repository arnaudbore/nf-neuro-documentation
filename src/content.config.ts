import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	pipelines: defineCollection({
		type: 'data',
		schema: z.object({
			name: z.string(),
			organisation: z.string(),
			documentation: z.string().optional(),
		}),
	}),
};