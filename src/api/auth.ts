import request from '@/utils/request';

export interface LoginResponse {
	token: string;
	userInfo: {
		id: number;
		name: string;
		role: string;
		avatar: string;
	};
}

export function loginApi(data: { username: string; password: string }) {
	return request.post<unknown, LoginResponse>('/auth/login', data);
}
