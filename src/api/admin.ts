import request from '@/utils/request';
import { AdminUserInfo } from '@/types/AdminUserInfo';
import { type ApiResponse } from '@/utils/request';
import type { BookingRow } from '@/api/science';

export interface AdminPasswordLoginParams {
	phone: string;
	password: string;
}

export type AdminPasswordLoginResponse = ApiResponse<AdminUserInfo>;

export type AdminInformationResponse = ApiResponse<AdminUserInfo>;

export interface UpdateAdminPasswordParams {
	password: string;
}

export interface SearchScienceReservationsParams {
	endDate?: string;
	groupType?: number | string;
	name?: string;
	phone?: string;
	startDate?: string;
	status?: number | string;
	timeRange?: string;
}

export interface AdminCommonResponse {
	message?: string;
	[key: string]: unknown;
}

export type ScienceReservationsResponse = ApiResponse<BookingRow[]>;

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
	return request.post<unknown, ApiResponse>('/api/admin/adminLogout');
}

export function getAllScienceReservationsApi() {
	return request.post<unknown, ScienceReservationsResponse>('/api/admin/getAllScienceReservations');
}

export function searchScienceReservationsNativeApi(data: SearchScienceReservationsParams) {
	return request.post<unknown, ScienceReservationsResponse>('/api/admin/searchScienceReservationsNative', data);
}
