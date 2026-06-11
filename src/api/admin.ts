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
	return request.post<unknown, AdminPasswordLoginResponse>('/admin/passWordLogin', data);
}

export function getAdminInformationApi() {
	return request.post<unknown, AdminInformationResponse>('/admin/getAdminInforMation');
}

export function updateAdminPasswordApi(data: UpdateAdminPasswordParams) {
	return request.post<unknown, AdminCommonResponse>('/admin/updatePassWord', data);
}

export function adminLogoutApi() {
	return request.post<unknown, AdminCommonResponse>('/admin/adminLogout');
}
