import request from '@/utils/request';
import { AdminUserInfo } from '@/types/AdminUserInfo';
import { type ApiResponse } from '@/utils/request';
import type { BookingRow } from '@/types/BookingInfo';
import type { SessionRow, SessionQuery } from '@/types/SessionInfo';

export interface AdminPasswordLoginParams {
	phone: string;
	password: string;
}

export type AdminPasswordLoginResponse = ApiResponse<AdminUserInfo>;

export type AdminInformationResponse = ApiResponse<AdminUserInfo>;

export interface UpdateAdminPasswordParams {
	password: string;
}

export interface ReservationActionParams {
	reId: number;
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

export interface AddScienceConfigurationParams {
	dateTime: string;
	startTime: string;
	endTime: string;
	totalNumber: number;
	operatorName: string;
}

export interface BatchAddScienceConfigurationParams {
	startDate: string;
	endDate: string;
	startTimes: string[];
	endTimes: string[];
	totalNumber: number;
	operatorName: string;
}

export interface UpdateScienceConfigurationParams extends AddScienceConfigurationParams {
	configId: number;
}

export interface ScienceConfigurationActionParams {
	configId: number;
}

export interface AdminCommonResponse {
	message?: string;
	[key: string]: unknown;
}

export type ScienceReservationsResponse = ApiResponse<BookingRow[]>;
export type ScienceConfigurationResponse = ApiResponse<SessionRow[]>;

/** 登录后台管理系统 */
export function adminPasswordLoginApi(data: AdminPasswordLoginParams) {
	return request.post<unknown, AdminPasswordLoginResponse>('/api/admin/passWordLogin', data);
}

/** 获取登录信息 */
export function getAdminInformationApi() {
	return request.post<unknown, AdminInformationResponse>('/api/admin/getAdminInforMation');
}

/** 修改登录密码 */
export function updateAdminPasswordApi(data: UpdateAdminPasswordParams) {
	return request.post<unknown, AdminCommonResponse>('/api/admin/updatePassWord', data);
}

/** 退出后台管理系统登录 */
export function adminLogoutApi() {
	return request.post<unknown, ApiResponse>('/api/admin/adminLogout');
}

/** 查询所有预约信息 */
export function getAllScienceReservationsApi() {
	return request.post<unknown, ScienceReservationsResponse>('/api/admin/getAllScienceReservations');
}

/** 筛选预约信息 */
export function searchScienceReservationsNativeApi(data: SearchScienceReservationsParams) {
	return request.post<unknown, ScienceReservationsResponse>('/api/admin/searchScienceReservationsNative', data);
}

/** 确认参观 */
export function confirmAttendanceApi(data: ReservationActionParams) {
	return request.post<unknown, ApiResponse>('/api/admin/confirmAttendance', data);
}

/** 取消参观 */
export function cancelAppointmentApi(data: ReservationActionParams) {
	return request.post<unknown, ApiResponse>('/api/admin/cancelAppointment', data);
}

/** 查询科普馆所有场次配置 */
export function getAllScienceConfigurationApi() {
	return request.post<unknown, ScienceConfigurationResponse>('/api/admin/getAllScienceConfiguration');
}

/** 筛选场次配置 */
export function searchScienceConfigurationApi(data: SessionQuery) {
	return request.post<unknown, ScienceConfigurationResponse>('/api/admin/searchScienceConfiguration', data);
}

/** 添加科普馆场次配置 */
export function addScienceConfigurationApi(data: AddScienceConfigurationParams) {
	return request.post<unknown, ApiResponse>('/api/admin/addScienceConfiguration', data);
}

/** 批量添加科普馆场次配置 */
export function batchAddScienceConfigurationApi(data: BatchAddScienceConfigurationParams) {
	return request.post<unknown, ApiResponse>('/api/admin/batchAddScienceConfiguration', data);
}

/** 修改科普馆场次配置 */
export function updateScienceConfigurationApi(data: UpdateScienceConfigurationParams) {
	return request.post<unknown, ApiResponse>('/api/admin/updateScienceConfiguration', data);
}

/** 余号清零 */
export function zeroClearingConfigurationApi(data: ScienceConfigurationActionParams) {
	return request.post<unknown, ApiResponse>('/api/admin/zeroClearingConfiguration', data);
}

/** 删除场次配置 */
export function deleteScienceConfigurationApi(data: ScienceConfigurationActionParams) {
	return request.post<unknown, ApiResponse>('/api/admin/deleteScienceConfiguration', data);
}
