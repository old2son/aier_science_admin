import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

import { useUserStore } from '@/stores/modules/user';

interface ApiResponse<T = unknown> {
	code?: number;
	message?: string;
	data?: T;
}

const request = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
	timeout: 12000
});

request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const userStore = useUserStore();

	if (userStore.token) {
		config.headers.Authorization = `Bearer ${userStore.token}`;
	}

	return config;
});

request.interceptors.response.use(
	(response) => {
		const result = response.data as ApiResponse;

		if (typeof result?.code === 'number') {
			if (result.code !== 0) {
				ElMessage.error(result.message ?? '请求失败');
				return Promise.reject(new Error(result.message ?? '请求失败'));
			}

			return result.data;
		}

		return response.data;
	},
	(error: AxiosError<{ message?: string }>) => {
		const message = error.response?.data?.message ?? error.message ?? '请求失败';
		ElMessage.error(message);
		return Promise.reject(error);
	}
);

export default request;
