import request from '@/utils/request';

export interface SessionRow {
	id: number;
	date: string;
	startTime: string;
	endTime: string;
	totalCount: number;
	remainCount: number;
	guideCount?: number;
	createdAt: string;
	operator: string;
}

export type BookingStatus = 'pending' | 'verified' | 'expired';

export interface BookingRow {
	id: number;
	name: string;
	phone: string;
	idCard: string;
	groupType: string;
	groupCount: number;
	attachment: string;
	date: string;
	startTime: string;
	endTime: string;
	status: BookingStatus;
	createdAt: string;
}

export interface SessionQuery {
	startDate?: string;
	endDate?: string;
}

export interface BookingQuery extends SessionQuery {
	timeSlot?: string;
	name?: string;
	phone?: string;
	groupType?: string;
	status?: string;
}

/** 活动场次行数据（日期拆分为开始日期/结束日期） */
export interface ActivitySessionRow {
	id: number;
	title: string;
	background: string;
	location?: string;
	coverKey?: string;
	startDate: string;
	endDate: string;
	startTime: string;
	endTime: string;
	totalCount: number;
	remainCount: number;
	createdAt: string;
	operator: string;
}

export interface ActivitySessionQuery {
	startDate?: string;
	endDate?: string;
}

export function getSessionList(params?: SessionQuery) {
	return request.get<unknown, SessionRow[]>('/science/sessions', { params });
}

export function getBookingList(params?: BookingQuery) {
	return request.get<unknown, BookingRow[]>('/science/bookings', { params });
}

export function getActivitySessionList(params?: ActivitySessionQuery) {
	return request.get<unknown, ActivitySessionRow[]>('/activity/sessions', { params });
}
