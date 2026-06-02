import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ElMessage } from 'element-plus';

import { useUserStore } from '@/stores/modules/user';

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
	(response) => response.data,
	(error: AxiosError<{ message?: string }>) => {
		const message = error.response?.data?.message ?? error.message ?? '请求失败';
		ElMessage.error(message);
		return Promise.reject(error);
	}
);

export default request;
