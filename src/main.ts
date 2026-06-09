import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
import './styles/index.css';

import App from './App.vue';
import router from './router';
import { setupStore } from './stores';
import { getMockServiceWorkerUrl, isMockEnabled } from './utils/mock';

async function enableMocking() {
	const { worker } = await import('./mocks/browser');
	return worker.start({
		onUnhandledRequest: 'bypass',
		serviceWorker: {
			url: getMockServiceWorkerUrl()
		}
	});
}

async function bootstrap() {
	if (isMockEnabled()) {
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
