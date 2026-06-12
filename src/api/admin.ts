import request from '@/utils/request';

export interface AdminPasswordLoginParams {
	phone: string;
	password: string;
}

export interface AdminUserInfo {
	id?: number | string;
	name?: string;
	phone?: string;
	role?: string;
	avatar?: string;
	[key: string]: unknown;
}

export interface AdminPasswordLoginResponse {
	token?: string;
	adminInfo?: AdminUserInfo;
	[key: string]: unknown;
}

export interface AdminInformationResponse {
	adminInfo?: AdminUserInfo;
	[key: string]: unknown;
}

export interface UpdateAdminPasswordParams {
	password: string;
}

export interface AdminCommonResponse {
	message?: string;
	[key: string]: unknown;
}

export function adminPasswordLoginApi(data: AdminPasswordLoginParams) {
	return request.post<unknown, AdminPasswordLoginResponse>('/api/admin/passWordLogin', data);
}

export function getAdminInformationApi() {
	return request.post<unknown, AdminInformationResponse>('/api/admin/getAdminInforMation');
}

export function updateAdminPasswordApi(data: UpdateAdminPasswordParams) {
	return request.post<unknown, AdminCommonResponse>('/api/admin/updatePassWord', data);
}

export function adminLogoutApi() {
	return request.post<unknown, AdminCommonResponse>('/api/admin/adminLogout');
}
