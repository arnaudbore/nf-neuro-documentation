// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import Icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: "https://scilus.github.io",
    base: "/nf-neuro",
    integrations: [
		starlight({
			title: 'nf-neuro',
			logo: {
				light: './src/assets/nf-neuro_logo_light.svg',
				dark: './src/assets/nf-neuro_logo_dark.svg',
				replacesTitle: true,
			},
			customCss: [
				'./src/styles/custom.css',
				'./src/styles/global.css'
			],
			components: {
				// Override the default `Hero` component.
				Hero: './src/components/newHero.astro',
			},
			social: {
				github: 'https://github.com/scilus/nf-neuro.git',
			},
			sidebar: [
				{ label: 'Welcome', slug: 'welcome' },
				{
					label: 'Create your pipeline',
					items: [
						{ label: 'Setup your computer', slug: 'pipeline/setup' },
						{ label: 'Tutorial',
							items: [
								{ label: 'Explore', slug: 'pipeline/tutorial_explore' },
								{ label: 'Steps 1 to 2', slug: 'pipeline/tutorial_steps_1-2' },
								{ label: 'Steps 3 to 4', slug: 'pipeline/tutorial_steps_3-4' },
								{ label: 'Steps 4 to 8', slug: 'pipeline/tutorial_steps_5-8' },
							]
						},
					],
				},
				{	
					label: 'How-to',
					items: [
						{
							label: "Nextflow",
							items: [
								{ label: 'Top-5 Operators', slug: 'how-to/nextflow/top-5-operators' },
								{ label: 'Custom Subworkflows', slug: 'how-to/nextflow/custom-subworkflows' },
							]
						},
						{
							label: "VSCode",
							items: [
								{ label: 'Data in devcontainers', slug: 'how-to/vscode/devcontainer-manage-data' },
								{ label: 'Nextflow support', slug: 'how-to/vscode/nextflow-language-support' }
							]
						}
					],
				},
				{
					label: 'Advanced Tutorials',
					items: [
						{ label: 'BIDS Input', slug: 'advanced-tutorials/bidsinput' },
						{ label: 'BIDS Output', slug: 'advanced-tutorials/bidsoutput' },
						{ label: 'MultiQC', slug: 'advanced-tutorials/multiqc' },
					],
				},
				{
					label: 'Contribute to nf-neuro',
					items: [
						{ label: 'Setup your computer', slug: 'contribute/setup' },
						{ label: 'Create your module',
							items: [
								'contribute/create-your-module/template',
								'contribute/create-your-module/main',
								'contribute/create-your-module/documentation',
								'contribute/create-your-module/tests',
								'contribute/create-your-module/arguments',
								'contribute/create-your-module/submit',
								'contribute/create-your-module/infrastructure',
								'contribute/create-your-module/resources',
							]
						},
						{ label: 'Create your subworkflow',
							items: [
								'contribute/create-your-subworkflow/subworkflows',
							]
						}
					]
				},
				{
					label: 'API Documentation',
					autogenerate: { directory: 'api' },
					collapsed: true,
				},
			],
    	})
	],
    vite: {
        plugins: [
			Icons({ compiler: 'astro' }),
			tailwindcss()
		],
		server: {
			watch: {
			  	ignored: [
					"**/.pnpm-store/**/*",
					"**/node_modules/**/*"
				],
			},
		},
    },
});