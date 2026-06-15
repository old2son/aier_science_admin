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

export type BookingStatus = 0 | 1 | 2 | 3;

export interface BookingMember {
	activityId: number;
	documentType: string;
	idNumber: string;
	reId: number;
	userAge: number;
	userName: string;
	userPhone: string;
}

export interface BookingRow {
	activityId: number;
	activityName: string;
	age: number | null;
	cancel: number | null;
	channel: string | null;
	colleagueName: string | null;
	colleagues: number;
	dateTime: string;
	excelUrl: string | null;
	expound: number;
	idNumber: string;
	members: BookingMember[];
	name: string | null;
	numbers: number;
	phone: string | null;
	reId: number;
	status: number;
	timeSlot: string;
	type: number;
	unitName: string | null;
	week: string;
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
	status?: BookingStatus | '';
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
