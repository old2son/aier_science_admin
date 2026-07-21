import { defineConfig, loadEnv, ConfigEnv, UserConfig, type Plugin, type PluginOption } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';

import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	const manualChunks = (id: string) => {
		if (!id.includes('node_modules')) return;

		if (
			id.includes('@open-file-viewer') ||
			id.includes('ag-psd') ||
			id.includes('pdfjs-dist') ||
			id.includes('mammoth') ||
			id.includes('jszip') ||
			id.includes('utif') ||
			id.includes('tiff')
		) {
			return 'vendor-open-file-viewer';
		}
		if (id.includes('echarts') || id.includes('zrender')) return 'vendor-echarts';
		if (id.includes('xlsx')) return 'vendor-xlsx';
		if (id.includes('element-plus') || id.includes('@element-plus')) return 'vendor-element-plus';
		if (id.includes('vue-router')) return 'vendor-vue-router';
		if (id.includes('pinia')) return 'vendor-pinia';
		if (id.includes('axios')) return 'vendor-axios';
		if (id.includes('/vue/') || id.includes('\\vue\\')) return 'vendor-vue';

		return 'vendor';
	};

	return {
		// base: '/adminManage/', // o2s.fun 网页用

		base: '/',

		plugins: [
			vue(),

			visualizer({
				filename: 'stats.html',
				open: true,
				gzipSize: true
			})
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		build: {
			rollupOptions: {
				output: {
					manualChunks
				}
			}
		},
		mode: mode,
		server: {
			host: '0.0.0.0',
			port: parseInt(env.VITE_PORT, 10) as number,
			cors: true, // 默认启用
			proxy:
				mode === 'development'
					? {
							[`/${env.VITE_API_URL}`]: {
								target: env.VITE_API_URL_TARGET,
								changeOrigin: true,
								rewrite: (path) => path.replace(new RegExp(`^/${env.VITE_API_URL}`), '')
							}
						}
					: undefined
		},
		preview: {
			port: 8080
		}
	};
});
