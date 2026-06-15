import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

import router from '@/router';
import { useUserStore } from '@/stores/modules/user';
// import { getRequestBaseUrl } from '@/utils/mock';
const requestBaseUrl = import.meta.env.VITE_API_URL_TARGET;

const TOKEN_KEY = 'aier_admin_token';
export interface ApiResponse<T = unknown> {
	code?: number;
	message?: string;
	data?: T;
}

let messageTimer: number | null = null;

const showError = (message: string) => {
	if (messageTimer) return;

	ElMessage.error(message);

	messageTimer = window.setTimeout(() => {
		messageTimer = null;
	}, 2000);
};

const toLogin = () => {
	localStorage.removeItem(TOKEN_KEY);
	router.replace({ name: 'Login' });
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
			toLogin();
			return Promise.reject(new Error(response.data.message ?? '请求失败'));
		}

		if (response.data.code !== 200) {
			showError(response.data.message ?? '请求失败');
			return Promise.reject(new Error(response.data.message ?? '请求失败'));
		}

		return response.data;
	},
	(error: AxiosError<{ message?: string }>) => {
		const message = error.response?.data?.message ?? error.message ?? '请求失败';
		toLogin();

		showError(message);
		return Promise.reject(error);
	}
);

export default request;
