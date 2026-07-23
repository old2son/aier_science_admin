import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

import router from '@/router';
import { useUserStore } from '@/stores/modules/user';
// import { getRequestBaseUrl } from '@/utils/mock';
const requestBaseUrl = import.meta.env.VITE_API_URL_TARGET;

export interface ApiResponse<T = unknown> {
	code?: number;
	message?: string;
	data?: T;
}

let messageTimer: number | null = null;

let isHandling401 = false;

const showError = (message: string) => {
	if (messageTimer) return;

	ElMessage.error(message);

	messageTimer = window.setTimeout(() => {
		messageTimer = null;
	}, 2000);
};

const handleLoginExpired = async () => {
	if (isHandling401) {
		return;
	}

	isHandling401 = true;

	try {
		const userStore = useUserStore();

		await userStore.logout();

		router.replace('/login');
	} catch (error) {
		console.error(error);
	}
};

const isLoginExpired = (message: string) => {
	return message.includes('JWT expired') || message.includes('登录失效') || message.includes('token失效');
};

const request = axios.create({
	// baseURL: getRequestBaseUrl(),
	baseURL: requestBaseUrl,
	timeout: 12000
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const userStore = useUserStore();

	if (userStore.token) {
		config.headers.token = userStore.token;
	}

	return config;
});

request.interceptors.response.use(
	(response) => {
		if (response.data.code === 0 && response.data.message === '登录失效，请重新登录') {
			showError(response.data.message ?? '请求失败');
			handleLoginExpired();
			return Promise.reject(new Error(response.data.message ?? '请求失败'));
		}

		if (response.data.code !== 200) {
			// showError(response.data.message ?? '请求失败');
			return Promise.reject(new Error(response.data.message ?? '请求失败'));
		}

		return response.data;
	},
	(error: AxiosError<{ message?: string }>) => {
		const message = error.response?.data?.message ?? error.message ?? '请求失败';

		if (isLoginExpired(message)) {
			showError('登录已过期，请重新登录');
			handleLoginExpired();
			return Promise.reject(error);
		}

		showError(message);

		return Promise.reject(error);
	}
);

export default request;
