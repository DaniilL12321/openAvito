import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'OpenAvito',
				short_name: 'OpenAvito',
				description: 'OpenAvito Web Application',
				theme_color: '#ffffff',
				icons: [
					{
						src: 'icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,json}']
			}
		})
	]
});
