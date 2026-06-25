import { defineConfig, loadEnv, ConfigEnv, UserConfig, type Plugin, type PluginOption } from 'vite';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	return {
		// base: '/adminManage/', // o2s.fun 网页用

		plugins: [vue()],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
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
