import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import './styles/index.css';

import App from './App.vue';
import router from './router';
import { setupStore } from './stores';

async function enableMocking() {
	const { worker } = await import('./mocks/browser');
	return worker.start({
		onUnhandledRequest: 'bypass',
		serviceWorker: {
			url: '/mockServiceWorker.js'
		}
	});
}

async function bootstrap() {
	if (import.meta.env.DEV) {
		await enableMocking();
	}

	const app = createApp(App);

	setupStore(app);

	app.use(router);
	app.use(ElementPlus, {
		locale: zhCn
	});
	app.mount('#app');
}

bootstrap();
